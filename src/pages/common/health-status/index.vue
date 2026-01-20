<template>
  <view class="health-status-page">
    <view class="header">
      <view class="header-btn" @tap="goBack">
        <text class="tn-icon-left" />
      </view>
      <view class="header-title">体重记录</view>
      <view class="header-avatar">
        <image :src="avatarUrl" mode="aspectFill" />
      </view>
    </view>

    <view class="content">
      <view class="summary-card">
        <view class="summary-top">
          <view>
            <view class="summary-time">{{ latestRecordTimeText }}</view>
            <view class="summary-weight">
              <text class="weight-value">{{ latestWeightText }}</text>
              <text class="weight-unit">{{ weightUnitText }}</text>
            </view>
          </view>
          <view class="summary-metrics">
            <view class="metric-item">
              <text class="metric-label">BMI</text>
              <text class="metric-value">{{ bmiText }}</text>
            </view>
            <view class="metric-item">
              <text class="metric-label">体脂率</text>
              <text class="metric-value">--</text>
            </view>
          </view>
        </view>

        <view class="summary-progress">
          <view class="progress-header">
            <text class="progress-label">目标进度</text>
            <text class="progress-text">{{ progressPercentText }}</text>
          </view>
          <view class="progress-track">
            <view class="progress-fill" :style="{ width: `${progressPercentValue}%` }" />
          </view>
          <view class="progress-footer">
            <view class="progress-item">
              <text class="progress-item-label">起始</text>
              <text class="progress-item-value">{{ startWeightText }}</text>
            </view>
            <view class="progress-item">
              <text class="progress-item-label">目标</text>
              <text class="progress-item-value">{{ targetWeightText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">体重趋势</text>
          <text class="card-subtitle">近7天</text>
        </view>
        <view class="chart-area">
          <svg v-if="weightChartPoints" viewBox="0 0 100 40" class="chart-svg">
            <polyline
              fill="none"
              stroke="#10b981"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="weightChartPoints"
            />
            <circle
              v-if="weightChartLastPoint"
              :cx="weightChartLastPoint.x"
              :cy="weightChartLastPoint.y"
              r="3"
              fill="#10b981"
            />
          </svg>
          <view v-else class="chart-empty">暂无记录</view>
        </view>
        <view v-if="chartDateLabels.length" class="chart-labels">
          <text v-for="(label, index) in chartDateLabels" :key="`${label}-${index}`" class="chart-label">{{ label }}</text>
        </view>
      </view>

      <view class="record-card">
        <view class="card-header">
          <text class="card-title">体重记录</text>
          <text class="card-subtitle">{{ recordCountText }}</text>
        </view>
        <view v-if="recordDisplayList.length" class="record-list">
          <view v-for="item in recordDisplayList" :key="item.id" class="record-item">
            <view class="record-time">
              <text class="record-date">{{ item.dateText }}</text>
              <text class="record-clock">{{ item.timeText }}</text>
            </view>
            <view class="record-value">
              <text class="record-weight">{{ item.weightText }}</text>
              <text class="record-unit">{{ weightUnitText }}</text>
              <view class="record-delta" :class="item.deltaClass">
                <text>{{ item.deltaText }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="record-empty">暂无体重记录</view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="add-btn" @tap="handleAddRecord">记录体重</view>
    </view>

    <WeightRecordModal
      v-model:visible="weightModalVisible"
      :initial-weight="modalInitialWeightKg"
      :initial-timestamp="modalInitialTimestamp"
      @save="handleWeightSave"
    />
  </view>
</template>

<script setup lang="ts">
import WeightRecordModal from '@/components/weight-record-modal/index.vue';
import type { HealthUserProfiles, UserHealthStats } from '@/api/health/types';
import { HealthApi } from '@/api';
import { useUserStore } from '@/store';
import defaultAvatar from '@/static/images/logo.png';

interface WeightRecord {
  id: string;
  weight: number;
  timestamp: number;
}

interface WeightRecordDisplay {
  id: string;
  dateText: string;
  timeText: string;
  weightText: string;
  deltaText: string;
  deltaClass: string;
}

interface ChartPoint {
  x: number;
  y: number;
}

const LOCAL_WEIGHT_KEY = 'health_status_weight_records';
const DEFAULT_WEIGHT = 60;

const userStore = useUserStore();
const healthProfile = ref<HealthUserProfiles | null>(null);
const remoteWeightRecords = ref<WeightRecord[]>([]);
const localWeightRecords = ref<WeightRecord[]>([]);
const weightRecords = ref<WeightRecord[]>([]);
const weightUnitText = '公斤';
const weightModalVisible = ref(false);
const modalInitialWeightKg = ref(DEFAULT_WEIGHT);
const modalInitialTimestamp = ref(Date.now());

const avatarUrl = computed(() => {
  return healthProfile.value?.avatarUrl || userStore.profile?.avatarUrl || userStore.avatar || defaultAvatar;
});

/**
 * 页面显示时拉取用户信息与体重数据
 */
onShow(async () => {
  await ensureUserInfo();
  loadLocalWeightRecords();
  await Promise.all([fetchHealthProfile(), fetchLatestWeightRecords()]);
});

/**
 * 确保用户信息可用
 */
async function ensureUserInfo() {
  if (userStore.user_id)
    return;
  await userStore.info().catch(() => {
    uni.$u.toast('获取个人信息失败');
  });
}

/**
 * 获取健康档案
 */
async function fetchHealthProfile() {
  const userId = userStore.user_id;
  if (!userId) {
    healthProfile.value = null;
    return;
  }
  const profile = await HealthApi.getHealthProfileByUserId(userId).catch(() => {
    uni.$u.toast('获取健康档案失败');
    return null;
  });
  healthProfile.value = profile;
}

/**
 * 获取近七天体重记录
 */
async function fetchLatestWeightRecords() {
  const userId = userStore.user_id;
  if (!userId) {
    remoteWeightRecords.value = [];
    refreshWeightRecords();
    return;
  }
  const stats = await HealthApi.getLatest7DaysHealthStats(userId).catch(() => {
    uni.$u.toast('获取体重记录失败');
    return [];
  });
  remoteWeightRecords.value = buildWeightRecords(stats);
  refreshWeightRecords();
}

/**
 * 转换体重记录数据
 */
function buildWeightRecords(stats: UserHealthStats[]) {
  const list = stats.map((item, index) => {
    const weight = Number(item.weight);
    if (!Number.isFinite(weight))
      return null;
    const recordTime = parseDateTime(item.recordDate)?.getTime()
      ?? Date.now() - index * 24 * 60 * 60 * 1000;
    return {
      id: String(item.id ?? `${recordTime}-${index}`),
      weight,
      timestamp: recordTime,
    } satisfies WeightRecord;
  });
  return list.filter((item): item is WeightRecord => Boolean(item));
}

/**
 * 读取本地体重记录
 */
function loadLocalWeightRecords() {
  const raw = uni.getStorageSync(LOCAL_WEIGHT_KEY);
  if (!raw) {
    localWeightRecords.value = [];
    refreshWeightRecords();
    return;
  }
  let data: unknown;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  catch {
    localWeightRecords.value = [];
    refreshWeightRecords();
    return;
  }
  if (!Array.isArray(data)) {
    localWeightRecords.value = [];
    refreshWeightRecords();
    return;
  }
  const list = data
    .map((item: WeightRecord) => ({
      id: String(item.id ?? ''),
      weight: Number(item.weight),
      timestamp: Number(item.timestamp),
    }))
    .filter((item: WeightRecord) => Number.isFinite(item.weight) && Number.isFinite(item.timestamp));
  localWeightRecords.value = list;
  refreshWeightRecords();
}

/**
 * 合并远端与本地记录
 */
function mergeWeightRecords(remoteList: WeightRecord[], localList: WeightRecord[]) {
  const map = new Map<string, WeightRecord>();
  [...remoteList, ...localList].forEach((item) => {
    const key = `${item.timestamp}-${item.weight}`;
    map.set(key, item);
  });
  return [...map.values()].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 更新体重记录数据源
 */
function refreshWeightRecords() {
  weightRecords.value = mergeWeightRecords(remoteWeightRecords.value, localWeightRecords.value);
}

/**
 * 保存本地体重记录
 */
function saveLocalWeightRecords() {
  uni.setStorageSync(LOCAL_WEIGHT_KEY, JSON.stringify(localWeightRecords.value));
}

/**
 * 解析日期字符串
 */
function parseDateTime(value?: string) {
  if (!value)
    return null;
  const normalized = value.replace(/-/g, '/');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime()))
    return null;
  return date;
}

/**
 * 格式化日期时间
 */
function formatDateTime(timestamp: number, type: 'full' | 'date' | 'time' = 'full') {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = padZero(date.getHours());
  const minute = padZero(date.getMinutes());
  if (type === 'time')
    return `${hour}:${minute}`;
  if (type === 'date')
    return `${month}/${day}`;
  return `${date.getFullYear()}/${padZero(month)}/${padZero(day)} ${hour}:${minute}`;
}

/**
 * 数字补零
 */
function padZero(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * 格式化体重文本
 */
function formatWeight(value?: number) {
  if (value === undefined || value === null)
    return '--';
  return Number.isFinite(value) ? value.toFixed(1) : String(value);
}

/**
 * 生成体重折线图坐标
 */
function buildWeightChartPointList(records: WeightRecord[]) {
  if (!records.length)
    return [] as ChartPoint[];
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp).slice(-7);
  const weights = sorted.map((item) => item.weight);
  if (!weights.length)
    return [] as ChartPoint[];
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const range = maxWeight - minWeight || 1;
  const width = 100;
  const height = 40;
  const paddingX = 6;
  const paddingY = 6;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const step = weights.length > 1 ? usableWidth / (weights.length - 1) : 0;
  return weights.map((weight, index) => {
    const x = paddingX + step * index;
    const y = paddingY + (maxWeight - weight) / range * usableHeight;
    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  });
}

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack();
}

/**
 * 点击记录体重按钮
 */
function handleAddRecord() {
  openWeightModal();
}

/**
 * 打开记录体重弹窗
 */
function openWeightModal() {
  const latestWeight = latestRecord.value?.weight
    ?? healthProfile.value?.userHealthStats?.weight
    ?? healthProfile.value?.userWeightGoals?.startWeight
    ?? DEFAULT_WEIGHT;
  modalInitialWeightKg.value = Number.isFinite(latestWeight) ? latestWeight : DEFAULT_WEIGHT;
  modalInitialTimestamp.value = Date.now();
  weightModalVisible.value = true;
}

/**
 * 保存体重记录
 */
async function handleWeightSave(payload: { weight: number; timestamp: number }) {
  const recordDate = formatRecordDate(payload.timestamp);
  const saveSuccess = await HealthApi.createHealthStats({
    recordDate,
    weight: payload.weight,
  }).then(() => true).catch(() => {
    uni.$u.toast('保存体重记录失败');
    return false;
  });
  const record: WeightRecord = {
    id: `${payload.timestamp}`,
    weight: Number(payload.weight.toFixed(1)),
    timestamp: payload.timestamp,
  };
  localWeightRecords.value = mergeWeightRecords([record], localWeightRecords.value);
  saveLocalWeightRecords();
  refreshWeightRecords();
  if (healthProfile.value?.userHealthStats)
    healthProfile.value.userHealthStats.weight = record.weight;
  if (healthProfile.value?.userHealthStats)
    healthProfile.value.userHealthStats.recordDate = saveSuccess ? recordDate : healthProfile.value.userHealthStats.recordDate;
}

/**
 * 格式化记录时间
 */
function formatRecordDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hour = padZero(date.getHours());
  const minute = padZero(date.getMinutes());
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

const sortedRecords = computed(() => {
  return [...weightRecords.value].sort((a, b) => b.timestamp - a.timestamp);
});

const latestRecord = computed(() => sortedRecords.value[0] ?? null);

const latestWeightText = computed(() => {
  const record = latestRecord.value;
  return record ? record.weight.toFixed(1) : '--';
});

const latestRecordTimeText = computed(() => {
  const record = latestRecord.value;
  return record ? formatDateTime(record.timestamp, 'full') : '--';
});

const bmiText = computed(() => {
  const record = latestRecord.value;
  const height = healthProfile.value?.userHealthStats?.height;
  if (!record || !height)
    return '--';
  const bmi = record.weight / ((height / 100) ** 2);
  if (!Number.isFinite(bmi))
    return '--';
  return bmi.toFixed(1);
});

const progressPercent = computed(() => {
  const startWeight = healthProfile.value?.userWeightGoals?.startWeight;
  const targetWeight = healthProfile.value?.userWeightGoals?.targetWeight;
  const currentWeight = latestRecord.value?.weight;
  if (startWeight === undefined || targetWeight === undefined || currentWeight === undefined)
    return null;
  const total = startWeight - targetWeight;
  if (total <= 0)
    return null;
  const lost = startWeight - currentWeight;
  const ratio = Math.min(Math.max(lost / total, 0), 1);
  return ratio * 100;
});

const progressPercentValue = computed(() => progressPercent.value ?? 0);

const progressPercentText = computed(() => {
  if (progressPercent.value === null)
    return '--';
  return `${progressPercent.value.toFixed(1)}%`;
});

const startWeightText = computed(() => {
  return formatWeight(healthProfile.value?.userWeightGoals?.startWeight);
});

const targetWeightText = computed(() => {
  return formatWeight(healthProfile.value?.userWeightGoals?.targetWeight);
});

const weightChartPointList = computed(() => {
  return buildWeightChartPointList(sortedRecords.value);
});

const weightChartPoints = computed(() => {
  if (!weightChartPointList.value.length)
    return '';
  return weightChartPointList.value.map((point) => `${point.x},${point.y}`).join(' ');
});

const weightChartLastPoint = computed(() => {
  const list = weightChartPointList.value;
  return list.length ? list[list.length - 1] : null;
});

const chartDateLabels = computed(() => {
  return [...sortedRecords.value]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-7)
    .map((item) => formatDateTime(item.timestamp, 'date'));
});

const recordDisplayList = computed<WeightRecordDisplay[]>(() => {
  return sortedRecords.value.map((record, index) => {
    const prevRecord = sortedRecords.value[index + 1];
    const delta = prevRecord ? record.weight - prevRecord.weight : 0;
    const deltaText = prevRecord ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '--';
    const deltaClass = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
    return {
      id: record.id,
      dateText: formatDateTime(record.timestamp, 'date'),
      timeText: formatDateTime(record.timestamp, 'time'),
      weightText: record.weight.toFixed(1),
      deltaText,
      deltaClass,
    };
  });
});

const recordCountText = computed(() => {
  const count = recordDisplayList.value.length;
  return count ? `${count} 条` : '暂无记录';
});
</script>

<style lang="scss" scoped>
.health-status-page {
  min-height: 100vh;
  background: #f8fafc;
  color: #111827;
  padding-bottom: 180rpx;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx;
  background: rgba(248, 250, 252, 0.92);
  backdrop-filter: blur(12px);
}

.header-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #4b5563;
  box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.08);
}

.header-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.header-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #e5f7ef;
}

.header-avatar image {
  width: 100%;
  height: 100%;
}

.content {
  padding: 12rpx 28rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.summary-card,
.chart-card,
.record-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 28rpx;
  box-shadow: 0 18rpx 36rpx rgba(15, 23, 42, 0.06);
}

.summary-top {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.summary-time {
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 12rpx;
}

.summary-weight {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.weight-value {
  font-size: 64rpx;
  font-weight: 800;
  color: #111827;
}

.weight-unit {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 600;
}

.summary-metrics {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  text-align: right;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.metric-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.metric-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.summary-progress {
  margin-top: 28rpx;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-label {
  font-size: 22rpx;
  color: #6b7280;
}

.progress-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #10b981;
}

.progress-track {
  height: 16rpx;
  background: #e5e7eb;
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.progress-footer {
  margin-top: 18rpx;
  display: flex;
  justify-content: space-between;
  font-size: 20rpx;
  color: #6b7280;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.progress-item-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.progress-item-value {
  font-size: 22rpx;
  font-weight: 700;
  color: #111827;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #111827;
}

.card-subtitle {
  font-size: 20rpx;
  color: #9ca3af;
}

.chart-area {
  height: 180rpx;
  background: #f8fafc;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-svg {
  width: 100%;
  height: 100%;
  padding: 16rpx 12rpx;
}

.chart-empty {
  font-size: 22rpx;
  color: #9ca3af;
}

.chart-labels {
  margin-top: 16rpx;
  display: flex;
  justify-content: space-between;
  font-size: 18rpx;
  color: #9ca3af;
}

.chart-label {
  min-width: 60rpx;
  text-align: center;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.record-date {
  font-size: 22rpx;
  font-weight: 700;
  color: #111827;
}

.record-clock {
  font-size: 20rpx;
  color: #9ca3af;
}

.record-value {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.record-weight {
  font-size: 32rpx;
  font-weight: 800;
  color: #111827;
}

.record-unit {
  font-size: 20rpx;
  color: #9ca3af;
}

.record-delta {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.record-delta.up {
  background: #fee2e2;
  color: #ef4444;
}

.record-delta.down {
  background: #dcfce7;
  color: #10b981;
}

.record-delta.flat {
  background: #e5e7eb;
  color: #6b7280;
}

.record-empty {
  padding: 24rpx 0;
  text-align: center;
  font-size: 22rpx;
  color: #9ca3af;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 28rpx 28rpx;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 45%);
}

.add-btn {
  height: 96rpx;
  border-radius: 999rpx;
  background: #34d399;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(16, 185, 129, 0.35);
}

</style>
