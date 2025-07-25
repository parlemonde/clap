use aws_lambda_events::encodings::Body;
use aws_lambda_events::event::apigw::ApiGatewayV2httpRequest;
use aws_lambda_events::event::apigw::ApiGatewayV2httpResponse;
use aws_lambda_events::http::HeaderMap;
use aws_sdk_lambda::primitives::Blob;
use lambda_runtime::{Error, LambdaEvent};
use std::env;

fn get_unknown_error() -> ApiGatewayV2httpResponse {
    ApiGatewayV2httpResponse {
        status_code: 500,
        headers: HeaderMap::new(),
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::Empty),
        is_base64_encoded: false,
        cookies: vec![],
    }
}

async fn get_response(
    payload: &ApiGatewayV2httpRequest,
    hash: &str,
) -> Result<ApiGatewayV2httpResponse, Error> {
    let payload = serde_json::to_string(payload)?;
    let config = aws_config::load_from_env().await;
    let client = aws_sdk_lambda::Client::new(&config);
    let function_name_prefix = env::var("FUNCTION_NAME_PREFIX")?;
    let invoke_result = client
        .invoke()
        .function_name(format!("{}-{}", function_name_prefix, hash))
        .payload(Blob::new(payload))
        .send()
        .await;
    let invoke_result_payload = invoke_result?.payload;
    if invoke_result_payload.is_none() {
        return Ok(get_unknown_error());
    }
    let invoke_result_payload = String::from_utf8(invoke_result_payload.unwrap().into_inner());
    let response = serde_json::from_str(invoke_result_payload?.as_str())?;
    Ok(response)
}

pub(crate) async fn function_handler(
    event: LambdaEvent<ApiGatewayV2httpRequest>,
) -> Result<ApiGatewayV2httpResponse, Error> {
    let hash = event.payload.headers.get("x-preview-hash");
    let hash = match hash {
        Some(header_value) => header_value.to_str().unwrap_or(""),
        None => ""
    };
    if hash.len() == 0 {
        return Ok(get_unknown_error());
    }

    let response = get_response(&event.payload, hash).await;
    if response.is_err() {
        return Ok(get_unknown_error());
    }
    response
}
