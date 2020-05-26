import axios, { AxiosInstance } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import tough, { CookieJar } from 'tough-cookie';
import qs from 'qs';

axiosCookieJarSupport(axios);

const THECAMP_URL = 'https://thecamp.or.kr';

export type TheCampClientStatus = '__INIT__' | '__SIGNED_IN__';

export interface ICredential {
  id: string;
  password: string;
}

export class TheCampClient {
  client: AxiosInstance;
  status: TheCampClientStatus;
  credential: ICredential;
  jar: CookieJar;
  cookie: string;

  constructor(credential: ICredential) {
    this.jar = new tough.CookieJar();
    this.status = '__INIT__';
    this.client = axios.create({
      baseURL: THECAMP_URL,
      jar: this.jar,
      // FOR THE IMPROVED ERROR MESSAGE
      validateStatus: (statusNumber: number) => true,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    });
    this.credential = credential;
    this.cookie = '';
  }

  async login() {
    // FOR JSESSION
    await this.client.get(THECAMP_URL);
    // LOGIN
    const result = await this.client.post(`/login/loginA.do`, qs.stringify({
      'state': 'email-login',
      'autoLoginYn': 'N',
      'withdrawDate': '',
      'reCertYn': '',
      'telecomCd': '',
      'telecomNm': '',
      'osType': '',
      'osVersion': '',
      'deviceModel': '',
      'appVersion': '',
      'deviceWidth': '',
      'deviceHeight': '',
      'resultCd': '',
      'resultMsg': '',
      'userId': this.credential.id,
      'userPwd': this.credential.password,
    }));

    if (result.data && result.data.resultCd !== '0000') {
      return false;
    }

    this.status = '__SIGNED_IN__';
    this.cookie = await this.jar.getCookieString(THECAMP_URL);
    return true;
  }


  async getMessages() {
    const result = await this.client.post('/consolLetter/selectConsolLetterA.do', {
      trainneMgrSeq: 88896,
      statusCd: '',
      tempSaveYn: 'N',
      curPage: '',
      _url: 'https://thecamp.or.kr/consolLetter/viewConsolLetterMain.do',
      keepSearchConditionUrlKey: 'consolLetter',
    }, {
      headers: {
        cookie: this.cookie,
      },
    });
  }

  // TODO: Support for sending pictures and,
  async sendMessage(userName: string, title: string, content: string, traineeSeq: number = 888896) {
    const result = await this.client.post('/consolLetter/insertConsolLetterA.do', qs.stringify({
      boardDiv: 'sympathyLetter',
      tempSaveYn: 'N',
      sympathyLetterEditorFileGroupSeq: '',
      fileGroupMgrSeq: '',
      fileMgrSeq: '',
      sympathyLetterMgrSeq: '',
      traineeMgrSeq: traineeSeq,
      sympathyLetterContent: content,
      sympathyLetterSubject: `${title} <보내는 이: ${userName}> `,
    }), {
      headers: {
        cookie: this.cookie,
      },
    });

    // TODO: 후처리 해주어야 함
    if (result) {

    }
  }

  async getLetters() {
    const result = await this.client.post('/consolLetter/selectConsolLetterA.do', qs.stringify({
      traineeMgrSeq: 888896,
      statusCd: '',
      tempSaveYn: 'N',
      curPage: '',
      _url: 'https://thecamp.or.kr/consolLetter/viewConsolLetterMain.do',
      keepSearchConditionUrlKey: 'consolLetter',
    }), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'path': '/consolLetter/insertConsolLetterA.do',
        cookie: this.cookie,
      },
    });

    return result.data.listResult;
  }

  async getCafes() {
    // https://thecamp.or.kr/eduUnitCafe/viewEduUnitCafeMain.do
    // PARSER
  }
}
