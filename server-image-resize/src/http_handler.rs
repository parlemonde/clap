use aws_sdk_s3 as s3;
use bytes::Bytes;
use fast_image_resize::images::Image;
use fast_image_resize::{IntoImageView, Resizer};
use image::codecs::{jpeg::JpegEncoder, png::PngEncoder, webp::WebPEncoder};
use image::{GenericImageView, ImageFormat};
use image::{ImageEncoder, ImageReader};
use lambda_http::{Body, Error, Request, RequestExt, Response};
use std::env;
use std::{error, u32};

async fn fetch_image_bytes(
    key: &str,
) -> Result<(Bytes, Option<ImageFormat>), Box<dyn error::Error>> {
    let bucket = env::var("S3_BUCKET")?;
    let config = aws_config::load_from_env().await;
    let client = s3::Client::new(&config);
    let object = client.get_object().bucket(bucket).key(key).send().await?;
    let content_type = object.content_type().and_then(|s| {
        if s == "application/octet-stream" {
            None
        } else {
            Some(s)
        }
    });
    let format = match content_type {
        Some(mime_type) => ImageFormat::from_mime_type(mime_type),
        None => ImageFormat::from_path(key).ok(),
    };
    Ok((
        object.body.collect().await.map(|data| data.into_bytes())?,
        format,
    ))
}

fn get_resized_image(
    object_data: Bytes,
    format: ImageFormat,
    width: Option<u32>,
    quality: Option<u8>,
) -> Result<Vec<u8>, Box<dyn error::Error>> {
    // Decode image
    let mut image = ImageReader::new(std::io::Cursor::new(object_data));
    image.set_format(format);
    let image = image.decode()?;
    let (src_width, src_height) = image.dimensions();

    // Resize image
    let mut dst_width = src_width;
    let mut dst_height = src_height;
    if let Some(width) = width {
        if width < src_width {
            dst_width = width;
            dst_height = (src_height as f32 / src_width as f32 * width as f32) as u32;
        }
    }
    let mut dst_image = Image::new(
        dst_width,
        dst_height,
        image.pixel_type().ok_or("Could not get pixel type")?,
    );
    let mut resizer = Resizer::new();
    resizer.resize(&image, &mut dst_image, None)?;

    // Encode image
    let mut result_buf = Vec::new();
    match format {
        ImageFormat::Jpeg => {
            JpegEncoder::new_with_quality(&mut result_buf, quality.unwrap_or(75)).write_image(
                dst_image.buffer(),
                dst_width,
                dst_height,
                image.color().into(),
            )?;
        }
        ImageFormat::Png => {
            PngEncoder::new(&mut result_buf).write_image(
                dst_image.buffer(),
                dst_width,
                dst_height,
                image.color().into(),
            )?;
        }
        _ => {
            WebPEncoder::new_lossless(&mut result_buf).write_image(
                dst_image.buffer(),
                dst_width,
                dst_height,
                image.color().into(),
            )?;
        }
    }
    Ok(result_buf)
}

fn get_head_response(data: Vec<u8>, content_type: &str) -> Result<Response<Body>, Error> {
    let content_length = data.len();
    Ok(Response::builder()
        .status(200)
        .header("Content-Length", content_length.to_string())
        .header("Content-Type", content_type)
        .body(Body::Empty)
        .map_err(Box::new)?)
}

fn get_full_response(data: Vec<u8>, content_type: &str) -> Result<Response<Body>, Error> {
    let content_length = data.len();
    Ok(Response::builder()
        .status(200)
        .header("Cache-Control", "public, s-maxage=604800, max-age=2678400, immutable")
        .header("Content-Length", content_length.to_string())
        .header("Content-Type", content_type)
        .body(Body::from(data))
        .map_err(Box::new)?)
}

fn get_response(
    data: Vec<u8>,
    content_type: &str,
    is_head: bool,
) -> Result<Response<Body>, Error> {
    if is_head {
        return get_head_response(data, content_type);
    }
    get_full_response(data, content_type)
}

pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let query_string_parameters = event.query_string_parameters();
    let quality = query_string_parameters
        .first("q")
        .and_then(|w| w.parse::<u8>().ok());
    let width = query_string_parameters
        .first("w")
        .and_then(|w| w.parse::<u32>().ok());
    let key = &event.uri().path()[1..];
    let is_head_method = event.method() == "HEAD";

    let result = fetch_image_bytes(key).await;
    if result.is_err() {
        return Ok(Response::builder()
            .status(404)
            .body(Body::Empty)
            .map_err(Box::new)?);
    }

    let (object_data, format) = result.unwrap();
    let content_type = format
        .map(|format| format.to_mime_type())
        .unwrap_or("application/octet-stream");
    let is_format_supported = format
        .map(|format| {
            format == ImageFormat::Jpeg || format == ImageFormat::Png || format == ImageFormat::WebP
        })
        .unwrap_or(false);
    if width.is_none() || !is_format_supported {
        return get_response(object_data.to_vec(), &content_type, is_head_method);
    }

    let object_data = get_resized_image(object_data, format.unwrap(), width, quality);
    if object_data.is_err() {
        return Ok(Response::builder()
            .status(500)
            .body(Body::Empty)
            .map_err(Box::new)?);
    }
    let object_data = object_data.unwrap();

    return get_response(object_data, &content_type, is_head_method);
}
