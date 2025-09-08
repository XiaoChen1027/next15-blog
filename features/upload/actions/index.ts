"use server";

import imageType, { minimumBytes } from "image-type";
import fs from "node:fs";
import path from "node:path";
import { readChunk } from "read-chunk";
import sharp from "sharp";

import { OSS_UPLOAD_DIR } from "@/config";

import { isProduction } from "@/utils/env";

import { ERROR_NO_PERMISSION } from "@/constants";
import { noPermission } from "@/features/user";
import { aliOSS } from "@/lib/ali-oss";
import { createCuid } from "@/lib/cuid";

const UPLOAD_DIR = "uploads";
const PUBLIC_DIR = "public";

/**
 * 获取文件的绝对存储路径
 * @param input 相对 public 目录的路径，如 `/uploads/xxx.png`
 */
const getFilePath = (input: string) => {
  return path.join(process.cwd(), PUBLIC_DIR, input);
};

/**
 * 将上传的 File 写入到本地 `public/uploads` 目录
 * @param file 浏览器端传入的文件对象
 */
const saveFile = async (file: File) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const fileExtension = path.extname(file.name);
  const fileNameWithouExtension = file.name.replace(fileExtension, "");
  const baseURL = `/${UPLOAD_DIR}/${fileNameWithouExtension}-${createCuid()}${fileExtension}`;
  const filePath = getFilePath(baseURL);

  fs.writeFileSync(filePath, Buffer.from(fileArrayBuffer));

  return baseURL;
};

/**
 * 删除本地文件
 * @param input 相对 public 的文件路径
 */
const deleteFile = async (input: string) => {
  const filePath = getFilePath(input);

  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error.message);
      }
      resolve("");
    });
  });
};

/**
 * 读取文件头获取图片类型信息
 * @param filePath 绝对路径
 */
const getImageInfo = async (filePath: string) => {
  const buffer = await readChunk(filePath, { length: minimumBytes });

  const typeInfo = await imageType(buffer);

  return {
    info: typeInfo,
    isImage: Boolean(typeInfo),
    isGif: typeInfo ? typeInfo.ext === "gif" : false,
    isWebp: typeInfo ? typeInfo.ext === "webp" : false,
  };
};

/**
 * 如果不是图片，原样返回；如果是图片则压缩为 webp 并返回新路径
 * @param input 相对 public 的输入文件路径
 */
const compressImage = async (input: string): Promise<string> => {
  const inputFilePath = getFilePath(input);
  const { isGif, isImage, isWebp } = await getImageInfo(inputFilePath);

  if (!isImage || isWebp) {
    return input;
  }
  let animated = false;
  if (isGif) {
    animated = true;
  }

  const fileName = path.basename(inputFilePath);
  const fileExtension = path.extname(fileName);
  const fileNameWithouExtension = fileName.replace(fileExtension, "");

  const newFileName = `${fileNameWithouExtension}.webp`;
  const output = `/${UPLOAD_DIR}/${newFileName}`;
  const outputFilePath = getFilePath(output);

  return new Promise((resolve, reject) => {
    // 加载图片
    sharp(inputFilePath, { animated, limitInputPixels: false })
      .webp({ lossless: true })
      .toFile(outputFilePath, (error) => {
        if (error) {
          // TODO: 记录日志
          reject(error.message);
        } else {
          resolve(output);
        }
      });
  });
};

/**
 * 上传文件到阿里云 OSS 并返回可访问 URL
 * @param input 相对 public 的输入文件路径
 */
const uploadToOSS = async (input: string) => {
  const inputFilePath = getFilePath(input);
  const fileName = path.basename(inputFilePath);
  const buffer = fs.readFileSync(inputFilePath);
  const { name } = await aliOSS.put(
    `${OSS_UPLOAD_DIR}/${fileName}`,
    Buffer.from(buffer),
  );
  return aliOSS.getObjectUrl(name);
};

export const uploadFile = async (
  formData: FormData,
): Promise<{ error?: string; url?: string }> => {
  try {
    if (await noPermission()) {
      // throw ERROR_NO_PERMISSION;
      return { error: ERROR_NO_PERMISSION.message };
    }
    // 从 formData 获取文件
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "未选择文件" };
    }

    // 服务器端大小校验（需与 next.config.mjs 保持一致，这里 10MB）
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
      return { error: "文件大小超过 10MB 限制" };
    }

    let url = await saveFile(file);
    const localFileUrl = url;
    url = await compressImage(url);

    if (isProduction()) {
      const ossURL = await uploadToOSS(url);
      // 删除本地的压缩过后的图片文件
      const result = await deleteFile(url);
      if (result) {
        // TODO: 记录日志, 删除文件失败
      }
      return { url: ossURL };
    }

    // 如果是图片且已经被压缩过
    if (localFileUrl !== url) {
      // 删除旧的图片文件
      const result = await deleteFile(localFileUrl);
      if (result) {
        // TODO: 记录日志, 删除文件失败
      }
    }

    return { url };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `上传失败：${message}` };
  }
};
