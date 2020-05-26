import { TheCampClient, ICredential } from './thecamp-client';
import koa from 'koa';
import config from "../config";
import { ILetter } from './interfaces/thecamp-client.dto';

const theCampClient = new TheCampClient(config.thecamp.credential as ICredential);
export const sendLetter = async (ctx: koa.ParameterizedContext) => {
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
    if (!await theCampClient.login()) {
      throw new Error('로그인 시도중 실패하였습니다.')
    }
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

export const getLetters = async (ctx: koa.ParameterizedContext) => {
  if (theCampClient.status !== '__SIGNED_IN__') {
    if (!await theCampClient.login()) {
      throw new Error('로그인 시도중 실패하였습니다.')
    }
  }

  try {
    const letters = await theCampClient.getLetters();
    ctx.body = letters.map(prettyfyLetters);
  } catch (err) {
    console.log(err);
    ctx.body = err.message;
    ctx.status = 400;
  }
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

const prettyfyLetters = (letter: ILetter) => {
  const senderRegexResult = /<보내는 이: (.*)>/.exec(letter.sympathyLetterSubject);
  const hasSenderOnTitle = senderRegexResult !== null;
  const letterTitle = hasSenderOnTitle ?
    letter.sympathyLetterSubject.replace((senderRegexResult as RegExpExecArray)[0], '').trim() :
    letter.sympathyLetterSubject;

  return {
    sender: hasSenderOnTitle ? (senderRegexResult as RegExpExecArray)[1] : '알 수 없음',
    subject: letterTitle,
    status: letter.statusNm,
  }
};
