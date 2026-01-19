<template>
  <view class="home-page">
    <view class="header">
      <view class="avatar">
        <image :src="avatarUrl" mode="aspectFill" class="avatar-img" />
      </view>
      <view class="search" @tap="goToSearch">
        <text class="tn-icon-search search-icon" />
        <input class="search-input" type="text" placeholder="搜索食物营养和热量" disabled />
        <text class="tn-icon-scan scan-icon" />
      </view>
      <view class="notice">
        <text class="tn-icon-message notice-icon" />
        <view class="badge">4</view>
      </view>
    </view>

    <view class="content">
      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="title-text">体重管理方案</text>
            <text class="tn-icon-eye title-icon" @tap="toggleWeightVisible" />
          </view>
          <view class="card-week">
            第 <text class="week-highlight">{{ weekProgress }}</text> 周
          </view>
        </view>
        <view class="weight-plan">
          <view class="weight-item">
            <view class="weight-value">{{ weightVisible ? startWeightText : maskText }}</view>
            <view class="weight-label">初始（公斤）</view>
          </view>
          <view class="weight-progress">
            <view class="progress-ring">
              <svg viewBox="0 0 100 50" class="progress-svg">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f3f4f6" stroke-width="8" stroke-linecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#emerald-grad)" stroke-width="8" stroke-linecap="round" :stroke-dasharray="progressDasharray" />
                <defs>
                  <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#6ee7b7" />
                  </linearGradient>
                </defs>
              </svg>
              <view class="progress-info">
                <view class="progress-value">{{ weightVisible ? lostWeightText : maskText }}</view>
                <view class="progress-label">已减去(公斤)</view>
              </view>
            </view>
          </view>
          <view class="weight-item">
            <view class="weight-value">{{ weightVisible ? targetWeightText : maskText }}</view>
            <view class="weight-label">目标(公斤)</view>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="title-text">饮食热量</text>
          </view>
          <view class="diet-badge">
            <view class="diet-dot">GLP</view>
            <text class="diet-text">GLP饮食</text>
          </view>
        </view>
        <view class="diet-summary">
          <view class="diet-item">
            <view class="diet-label">还可吃</view>
            <view class="diet-value">
              <text class="diet-number">1645</text>
              <text class="diet-unit">千卡</text>
            </view>
          </view>
          <view class="diet-box diet-box-green">
            <view class="diet-box-value">0</view>
            <view class="diet-box-label">饮食</view>
          </view>
          <view class="diet-box diet-box-orange">
            <view class="diet-box-value">0</view>
            <view class="diet-box-label">运动*0.9</view>
          </view>
        </view>
        <view class="meal-grid">
          <view class="meal-item">
            <view class="meal-icon">
              <text class="tn-icon-watercup" />
            </view>
            <text class="meal-text">早餐</text>
          </view>
          <view class="meal-item">
            <view class="meal-icon">
              <text class="tn-icon-food" />
            </view>
            <text class="meal-text">午餐</text>
          </view>
          <view class="meal-item">
            <view class="meal-icon">
              <text class="tn-icon-moon" />
            </view>
            <text class="meal-text">晚餐</text>
          </view>
          <view class="meal-item">
            <view class="meal-icon">
              <text class="tn-icon-food" />
            </view>
            <text class="meal-text">加餐</text>
          </view>
          <view class="meal-item">
            <view class="meal-icon">
              <text class="tn-icon-footprint" />
            </view>
            <text class="meal-text">运动</text>
          </view>
        </view>
        <view class="camera-btn">
          <text class="tn-icon-camera" />
          <text class="camera-text">薄荷相机</text>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view>
            <view class="card-title">
              <text class="title-text">体重记录</text>
            </view>
            <view class="card-subtitle">09:56 更新</view>
          </view>
          <view class="record-actions">
            <view class="record-badge">
              <text class="tn-icon-safe" />
              <text class="record-badge-text">智能秤</text>
            </view>
            <view class="record-add">
              <text class="tn-icon-add" />
            </view>
          </view>
        </view>
        <view class="record-content">
          <view class="record-value">
            <text class="record-number">75.70</text>
            <text class="record-unit">公斤</text>
          </view>
          <view class="record-chart">
            <svg viewBox="0 0 100 40" class="chart-svg">
              <polyline
                fill="none"
                stroke="#10b981"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="0,35 15,30 30,32 45,25 60,20 75,15 90,10 100,8"
              />
              <circle cx="100" cy="8" r="3" fill="#10b981" />
            </svg>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HealthUserProfiles } from '@/api/health/types';
import { HealthApi } from '@/api';
import { useUserStore } from '@/store';
import defaultAvatar from '@/static/images/logo.png';

const userStore = useUserStore();
const healthProfile = ref<HealthUserProfiles | null>(null);
const weightVisible = ref<boolean>(true);
const maskText = '***';

const avatarUrl = computed(() => {
  return healthProfile.value?.avatarUrl || userStore.profile?.avatarUrl || userStore.avatar || defaultAvatar;
});

/**
 * 页面显示时拉取个人信息
 */
onShow(async () => {
  if (!userStore.user_id)
    await userStore.info().catch(() => {
      uni.$u.toast('获取个人信息失败');
    });
  await fetchHealthProfile();
});

/**
 * 获取健康档案
 */
async function fetchHealthProfile() {
  const userId = userStore.user_id;
  if (!userId)
    return;
  const profile = await HealthApi.getHealthProfileByUserId(userId).catch(() => {
    uni.$u.toast('获取健康档案失败');
    return null;
  });
  healthProfile.value = profile;
}

/**
 * 计算体重方案周数
 */
const weekProgress = computed(() => {
  const goals = healthProfile.value?.userWeightGoals;
  const createTime = goals?.createTime;
  const targetDate = goals?.targetDate;
  if (!createTime || !targetDate)
    return '--/--';
  const start = parseDateTime(createTime);
  const target = parseDateTime(targetDate);
  if (!start || !target)
    return '--/--';
  const totalWeeks = getWeekDiff(start, target);
  const currentWeeks = getWeekDiff(start, new Date());
  const safeTotal = Math.max(totalWeeks, 1);
  const safeCurrent = Math.min(Math.max(currentWeeks, 1), safeTotal);
  return `${safeCurrent}/${safeTotal}`;
});

/**
 * 格式化体重
 */
const startWeightText = computed(() => formatWeight(healthProfile.value?.userWeightGoals?.startWeight));
const targetWeightText = computed(() => formatWeight(healthProfile.value?.userWeightGoals?.targetWeight));

/**
 * 已减去体重
 */
const lostWeightText = computed(() => {
  const startWeight = healthProfile.value?.userWeightGoals?.startWeight;
  const currentWeight = healthProfile.value?.userHealthStats?.weight;
  if (startWeight === undefined || currentWeight === undefined)
    return '--';
  const value = Math.max(startWeight - currentWeight, 0);
  return value.toFixed(2);
});

/**
 * 计算体重进度比例
 */
const progressRatio = computed(() => {
  const startWeight = healthProfile.value?.userWeightGoals?.startWeight;
  const targetWeight = healthProfile.value?.userWeightGoals?.targetWeight;
  const currentWeight = healthProfile.value?.userHealthStats?.weight;
  if (startWeight === undefined || targetWeight === undefined || currentWeight === undefined)
    return 0;
  const total = startWeight - targetWeight;
  if (total <= 0)
    return 0;
  const lost = Math.max(startWeight - currentWeight, 0);
  return Math.min(lost / total, 1);
});

/**
 * 体重进度条样式
 */
const progressDasharray = computed(() => {
  const total = 180;
  const progress = total * progressRatio.value;
  return `${progress.toFixed(2)} ${total}`;
});

/**
 * 解析日期字符串
 */
function parseDateTime(value: string) {
  const normalized = value.replace(/-/g, '/');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime()))
    return null;
  return date;
}

/**
 * 计算周数差值
 */
function getWeekDiff(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  if (diff <= 0)
    return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
}

/**
 * 格式化体重文本
 */
function formatWeight(value?: number) {
  if (value === undefined || value === null)
    return '--';
  return Number.isFinite(value) ? value.toFixed(2) : String(value);
}

/**
 * 切换体重数据显示
 */
function toggleWeightVisible() {
  weightVisible.value = !weightVisible.value;
}

/**
 * 跳转搜索页面
 */
function goToSearch() {
  uni.navigateTo({ url: '/pages/common/search/index' });
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #f3f4f6;
  color: #111827;
  padding-bottom: env(safe-area-inset-bottom);
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.search {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 80rpx;
  background: #f3f4f6;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #111827;
}

.search-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 28rpx;
}

.scan-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 28rpx;
}

.notice {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-icon {
  font-size: 36rpx;
  color: #4b5563;
}

.badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  width: 28rpx;
  height: 28rpx;
  background: #ef4444;
  color: #fff;
  font-size: 18rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
}

.content {
  max-width: 750rpx;
  margin: 0 auto;
  padding-bottom: 120rpx;
}

.card {
  margin: 32rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 32rpx;
  border: 1rpx solid #f3f4f6;
  box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}

.title-icon {
  font-size: 24rpx;
  color: #10b981;
}

.card-week {
  font-size: 24rpx;
  color: #4b5563;
  font-weight: 600;
}

.week-highlight {
  color: #10b981;
  font-size: 28rpx;
}

.weight-plan {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.weight-item {
  text-align: center;
  width: 140rpx;
}

.weight-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #1f2937;
}

.weight-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.weight-progress {
  flex: 1;
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 240rpx;
  height: 120rpx;
  overflow: hidden;
}

.progress-svg {
  width: 100%;
  height: 100%;
}

.progress-info {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.progress-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #10b981;
}

.progress-label {
  font-size: 18rpx;
  color: #9ca3af;
}

.diet-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #eff6ff;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
}

.diet-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #60a5fa;
  color: #fff;
  font-size: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diet-text {
  font-size: 18rpx;
  color: #2563eb;
  font-weight: 700;
}

.diet-summary {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.diet-item {
  flex: 1;
}

.diet-label {
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 8rpx;
}

.diet-value {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.diet-number {
  font-size: 40rpx;
  font-weight: 800;
}

.diet-unit {
  font-size: 18rpx;
  color: #9ca3af;
}

.diet-box {
  flex: 1;
  border-radius: 24rpx;
  padding: 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.diet-box-green {
  background: rgba(16, 185, 129, 0.08);
}

.diet-box-orange {
  background: rgba(251, 146, 60, 0.12);
}

.diet-box-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #10b981;
}

.diet-box-orange .diet-box-value {
  color: #fb923c;
}

.diet-box-label {
  font-size: 18rpx;
  color: #9ca3af;
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
  margin-bottom: 32rpx;
  text-align: center;
}

.meal-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999rpx;
  border: 2rpx solid #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  font-size: 32rpx;
  margin: 0 auto 8rpx;
}

.meal-text {
  font-size: 20rpx;
  color: #6b7280;
}

.camera-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  background: #ecfdf5;
  color: #059669;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.camera-btn text {
  font-size: 28rpx;
}

.card-subtitle {
  font-size: 18rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.record-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.record-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #f3e8ff;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  color: #8b5cf6;
}

.record-badge-text {
  font-size: 18rpx;
  font-weight: 700;
}

.record-add {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.record-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.record-value {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.record-number {
  font-size: 48rpx;
  font-weight: 800;
  color: #1f2937;
}

.record-unit {
  font-size: 20rpx;
  color: #9ca3af;
}

.record-chart {
  width: 220rpx;
  height: 80rpx;
}

.chart-svg {
  width: 100%;
  height: 100%;
}
</style>
