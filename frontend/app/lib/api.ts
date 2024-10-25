"use client";

import axios from 'axios';
import { supabase } from './supabaseClient';

// export const apiClient = axios.create({
//   baseURL:'https://expirychecker-41bdd31a81d2.herokuapp.com/',
//   withCredentials: true,
// });

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',  // localhost:8000に戻す
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    // console.log('Token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('アクセストークンが見つかりません');
    }
  } catch (error) {
    console.error('セッション取得エラー:', error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('レスポンス:', response);
    return response;
  },
  (error) => {
    console.error('APIエラー:', error);
    return Promise.reject(error);
  }
);

export async function analyzeImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  try {
    const response = await apiClient.post('/api/image/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status !== 200) {
      throw new Error('画像分析に失敗しました');
    }

    return {
      image_url: response.data.image_url,
      name: response.data.name,
      category: response.data.category,
      expirationDate: response.data.expiration_date
    };
  } catch (error: unknown) {
    console.error('画像分析エラー:', error);
    throw new Error('画像の分析中にエラーが発生しました');
  }
}

export async function getUserProfile(userId: string) {
  try {
    const response = await apiClient.get(`/api/user/${userId}`);
    console.log('ユーザープロフィールレスポンス:', response.data);
    return response.data;
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    if (axios.isAxiosError(error)) {
      console.error('エラーレスポンス:', error.response?.data);
      throw new Error(`ユーザープロフィールの取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('ユーザープロフィールの取得中に予期せぬエラーが発生しました');
  }
}

export async function updateUserProfile(userId: string, profileData: Record<string, unknown>) {
  try {
    const response = await apiClient.put(`/api/user/${userId}`, profileData);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('ユーザープロフィール更新エラー:', error.message);
      throw new Error(`ユーザープロフィールの更新中にエラーが発生しました: ${error.message}`);
    } else {
      console.error('予期せぬエラー:', error);
      throw new Error('予期せぬエラーが発生しました');
    }
  }
}

export async function getNotificationSettings() {
  try {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // 通知設定が見つからない場合はnullを返す
      return null;
    }
    console.error('通知設定取得エラー:', error);
    throw new Error('通知設定の取得中にエラーが発生しました');
  }
}

export async function updateNotificationSettings(settings: Record<string, unknown>) {
  try {
    // user_idを含むsettingsオブジェクトをそのまま送信
    const response = await apiClient.put('/api/notifications/', settings);  // 末尾にスラッシュを追加
    return response.data;
  } catch (error) {
    console.error('通知設定更新エラー:', error);
    throw new Error('通知設定の更新中にエラーが発生しました');
  }
}

export async function getRecipes(ingredients: string[]) {
  try {
    const response = await apiClient.post('/api/foods/recipes', { ingredients });
    return response.data;
  } catch (error: unknown) {
    console.error('レシピ取得エラー:', error);
    if (axios.isAxiosError(error)) {
      console.error('エラーレスポンス:', error.response?.data);
      throw new Error(`レシピの取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('レシピの取得中に予期せぬエラーが発生しました');
  }
}
