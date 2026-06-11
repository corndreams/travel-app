import http from "./http.js";

export const getBanner = () => {
  return http("user/getBanner");
};

export const getHomeList = () => {
  return http("user/getHomeList");
};

export const login = (code) => {
  return http("login", { code }, "POST");
};

export const getUserInfo = () => {
  return http("getUserInfo");
};

export const detailProject = () => {
  return http("detail/project");
};

export const projectInfo = (data) => {
  return http("project/info", data);
};

export const likeList = () => {
  return http("like/list");
};

// 行程规划详情，后端在本地服务，与mock不同域，单独请求
const recommendBaseUrl = "http://127.0.0.1:3300";

export const travelRecommend = (data) => {
  return new Promise((resolve) => {
    uni.request({
      url: recommendBaseUrl + "/travel/recommend",
      data,
      timeout: 120000,
      method: "POST",
      header: {
        token: uni.getStorageSync("token") || "",
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: () => {
        resolve({ success: false, msg: "请求异常，请检查网络" });
      },
    });
  });
};

// UTF-8 字节数组转字符串（小程序无 TextDecoder，按完整行解码避免多字节截断）
function utf8ArrayToStr(bytes) {
  let str = "";
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i++];
    if (c < 0x80) {
      str += String.fromCharCode(c);
    } else if (c < 0xe0) {
      str += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (c < 0xf0) {
      str += String.fromCharCode(
        ((c & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f)
      );
    } else {
      const u =
        ((c & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
      const cc = u - 0x10000;
      str += String.fromCharCode(0xd800 + (cc >> 10), 0xdc00 + (cc & 0x3ff));
    }
  }
  return str;
}

// 流式对话请求（微信小程序用 enableChunked + onChunkReceived 实现 SSE）
export const fetchStream = (url, data, onChunk, onComplete, onError) => {
  let buffer = new Uint8Array(0);

  const processLine = (line) => {
    line = line.trim();
    if (!line.startsWith("data:")) return;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr) return;
    try {
      const json = JSON.parse(jsonStr);
      if (json.type === "chunk") {
        onChunk && onChunk(json.content);
      } else if (json.done) {
        onComplete && onComplete(json.data);
      } else if (json.error) {
        onError && onError(json.error);
      }
    } catch (e) {
      onError && onError("流式数据解析错误");
    }
  };

  const requestTask = uni.request({
    url: recommendBaseUrl + "/travel" + url,
    method: "POST",
    data,
    timeout: 120000,
    enableChunked: true,
    header: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      token: uni.getStorageSync("token") || "",
    },
    fail: () => {
      onError && onError("请求失败，请稍后重试");
    },
  });

  requestTask.onChunkReceived((res) => {
    const chunk = new Uint8Array(res.data);
    // 拼接到缓冲区，按换行(0x0A)切分完整行，剩余不完整部分留到下次
    const merged = new Uint8Array(buffer.length + chunk.length);
    merged.set(buffer, 0);
    merged.set(chunk, buffer.length);
    buffer = merged;
    let idx;
    while ((idx = buffer.indexOf(0x0a)) !== -1) {
      const lineBytes = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (lineBytes.length) {
        processLine(utf8ArrayToStr(lineBytes));
      }
    }
  });

  return requestTask;
};
