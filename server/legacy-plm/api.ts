import axios from "axios";
import { getRepository } from "typeorm";

import { User } from "../entities/user";
import { logger } from "../utils/logger";

import { PLM_User, createPLMUserToDB } from "./user";

const plmSsoUrl = process.env.PLM_HOST || "";
const client_id = process.env.CLIENT_ID || "";
const client_secret = process.env.CLIENT_SECRET || "";

export async function getUserFromPLM(code: string): Promise<User | null> {
  try {
    const ssoResponse = await axios({
      method: "POST",
      url: `${plmSsoUrl}/oauth/token`,
      data: {
        grant_type: "authorization_code",
        client_id,
        client_secret,
        redirect_uri: `${process.env.HOST_URL}/login`,
        code,
      },
    });
    const { access_token } = ssoResponse.data as { access_token: string };
    const userResponse = await axios({
      method: "GET",
      url: `${plmSsoUrl}/oauth/me?access_token=${access_token}`,
    });
    const plmUser = userResponse.data as PLM_User;
    let user = await getRepository(User).findOne({
      where: { email: plmUser.user_email },
    });
    if (user === undefined) {
      user = await createPLMUserToDB(plmUser);
    }
    return user;
  } catch (error) {
    logger.error(error);
    logger.error(JSON.stringify(error?.response?.data) || "");
    return null;
  }
}
