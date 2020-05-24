import { TheCampClient } from "./thecamp-client";
import config from "../config";

const theCampClient = new TheCampClient(config.thecamp.credential);

export const sendLetter = async (ctx) => {
  const {
    userName,
    title,
    content,
  } = ctx.request.body;

  try {
    validateLetterPayload(userName, title, content);
  } catch (err) {
    ctx.body = err.message;
    ctx.status = 400;
  }

  if (theCampClient.status !== '__SIGNED_IN__') {
    await theCampClient.login();
  }

  try {
    await theCampClient.sendMessage(userName, title, content);
  } catch (err) {
    ctx.body = err.message;
    ctx.status = 400;
  }

  ctx.body = '전송이 잘 되었습니다.';
  ctx.status = 202;
};

export const getLetters = async (ctx) => {
  // FIXME: 데이터 이쁘게 가공해서 주자
  return theCampClient.getLetters();
}

const validateLetterPayload = (userName?: string, title?: string, content?: string) => {
  if (typeof userName !== 'string' || userName === '') {
    throw new Error('유저 이름이 없습니다');
  } else if (typeof title !== 'string' || title === '') {
    throw new Error('타이틀이 없습니다');
  } else if (typeof content !== 'string' || content === '') {
    throw new Error('컨텐츠가 없습니다');
  }
};