"use client";

import { useState, useEffect } from 'react';
import { getNotificationSettings, updateNotificationSettings } from '../../lib/api';
import React from 'react';

interface NotificationSettings {
  enabled: boolean;
  timing: 'on_expiry_date' | 'one_day_before' | 'three_days_before';
  voice_enabled: boolean;
  user_id?: string; // user_idプロパティを追加
}

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    timing: 'on_expiry_date',
    voice_enabled: false,
    user_id: userId, // userIdを使用
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const userSettings = await getNotificationSettings();
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('通知設定の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const settingsToUpdate = {
        ...settings,
        user_id: userId // userIdを使用
      };
      const updatedSettings = await updateNotificationSettings(settingsToUpdate as Record<string, unknown>);
      setSettings(updatedSettings);
      alert('通知設定が更新されました。');
    } catch (error) {
      console.error('通知設定の更新に失敗しました:', error);
      alert('通知設定の更新に失敗しました。');
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-xl font-semibold mb-2">通知設定</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={settings.enabled}
            onChange={handleChange}
            className="mr-2"
          />
          通知を有効にする
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">通知タイミング:</label>
        <select
          name="timing"
          value={settings.timing}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="on_expiry_date">当日</option>
          <option value="one_day_before">1日前</option>
          <option value="three_days_before">3日前</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="voice_enabled"
            checked={settings.voice_enabled}
            onChange={handleChange}
            className="mr-2"
          />
          音声通知を有効にする
        </label>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        設定を保存
      </button>
    </form>
  );
}
