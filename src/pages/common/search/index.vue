<template>
  <view class="search-page">
    <view class="search-header">
      <view class="back-btn" @tap="goBack">
        <text class="tn-icon-left back-icon" />
      </view>
      <view class="search-bar">
      <text class="tn-icon-search search-icon" />
      <input
        v-model="keyword"
        class="search-input"
        type="text"
        placeholder="搜索食物营养和热量"
        confirm-type="search"
        @confirm="handleSearch()"
      />
      <view class="search-action" @tap="handleSearch()">搜索</view>
      </view>
    </view>

    <view v-if="showSuggestions" class="section">
      <view class="section-title">
        <text>搜索记录</text>
        <text class="clear-btn" @tap="clearHistory">清空</text>
      </view>
      <view v-if="historyList.length" class="tag-list">
        <view
          v-for="(item, index) in historyList"
          :key="`${item}-${index}`"
          class="tag"
          @tap="selectKeyword(item)"
        >
          {{ item }}
        </view>
      </view>
      <view v-else class="empty-tip">暂无搜索记录</view>
    </view>

    <view v-if="showSuggestions" class="section">
      <view class="section-title">
        <text>热门搜索</text>
      </view>
      <view class="tag-list">
        <view
          v-for="(item, index) in hotList"
          :key="`${item}-${index}`"
          class="tag hot"
          @tap="selectKeyword(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <view v-if="hasSearched && !showSuggestions" class="section">
      <view class="section-title">
        <view class="title-left">
          <text>搜索结果</text>
          <view class="unit-toggle" @tap="toggleEnergyUnit">
            切换{{ energyUnitLabel }}
          </view>
        </view>
      </view>
      <view v-if="loading" class="empty-tip">加载中...</view>
      <view v-else-if="!resultList.length" class="empty-tip">暂无搜索结果</view>
      <view v-else class="result-list">
        <view v-for="(item, index) in resultList" :key="index" class="result-item">
          <view class="result-head">
            <view class="result-name">{{ getFoodName(item) }}</view>
            <view class="result-energy">
              <text class="energy-value">{{ getEnergyValue(item) }}</text>
              <text class="energy-unit">{{ energyUnitLabel }}</text>
            </view>
          </view>
          <view class="result-sub">{{ item.categoryName || '未分类' }}</view>
          <view class="result-metrics">
            <view class="metric">
              <text class="metric-label">蛋白质</text>
              <text class="metric-value">{{ formatNumber(item.protein) }}</text>
              <text class="metric-unit">g</text>
            </view>
            <view class="metric">
              <text class="metric-label">脂肪</text>
              <text class="metric-value">{{ formatNumber(item.fat) }}</text>
              <text class="metric-unit">g</text>
            </view>
            <view class="metric">
              <text class="metric-label">碳水</text>
              <text class="metric-value">{{ formatNumber(item.carbohydrate) }}</text>
              <text class="metric-unit">g</text>
            </view>
            <view class="metric">
              <text class="metric-label">膳食纤维</text>
              <text class="metric-value">{{ formatNumber(item.fiber) }}</text>
              <text class="metric-unit">g</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HealthInfoItem } from '@/api/health/types';
import { HealthApi } from '@/api';

const keyword = ref<string>('');
const historyList = ref<string[]>([]);
const hotList = ref<string[]>(['鸡胸肉', '燕麦', '牛奶', '鸡蛋', '苹果', '香蕉']);
const resultList = ref<HealthInfoItem[]>([]);
const loading = ref<boolean>(false);
const hasSearched = ref<boolean>(false);
const energyUnit = ref<'kj' | 'kcal'>('kj');
const historyKey = 'health-search-history';

const showSuggestions = computed(() => {
  return keyword.value.trim().length === 0;
});

const energyUnitLabel = computed(() => {
  return energyUnit.value === 'kj' ? '千焦' : '千卡';
});

/**
 * 加载搜索记录
 */
function loadHistory() {
  const data = uni.getStorageSync(historyKey);
  historyList.value = Array.isArray(data) ? data : [];
}

/**
 * 保存搜索记录
 */
function saveHistory(list: string[]) {
  uni.setStorageSync(historyKey, list);
  historyList.value = list;
}

/**
 * 添加搜索记录
 */
function addHistory(value: string) {
  const list = historyList.value.filter(item => item !== value);
  list.unshift(value);
  saveHistory(list.slice(0, 10));
}

/**
 * 清空搜索记录
 */
function clearHistory() {
  saveHistory([]);
}

/**
 * 选择关键词并搜索
 */
function selectKeyword(value: string) {
  keyword.value = value;
  handleSearch(value);
}

/**
 * 获取展示名称
 */
function getFoodName(item: HealthInfoItem) {
  return item.name || item.foodName || item.title || '未知食物';
}

/**
 * 切换热量单位
 */
function toggleEnergyUnit() {
  energyUnit.value = energyUnit.value === 'kj' ? 'kcal' : 'kj';
}

/**
 * 获取热量数值
 */
function getEnergyValue(item: HealthInfoItem) {
  const value = item.calories;
  if (value === undefined || value === null)
    return '--';
  if (!Number.isFinite(value))
    return String(value);
  if (energyUnit.value === 'kcal')
    return (value / 4.184).toFixed(1);
  return value.toFixed(1);
}

/**
 * 格式化数值
 */
function formatNumber(value?: number) {
  if (value === undefined || value === null)
    return '--';
  return Number.isFinite(value) ? value.toFixed(1) : String(value);
}

/**
 * 执行搜索
 */
async function handleSearch(value?: string) {
  const searchValue = (value ?? keyword.value).trim();
  keyword.value = searchValue;
  if (!searchValue) {
    uni.$u.toast('请输入搜索内容');
    return;
  }
  addHistory(searchValue);
  loading.value = true;
  hasSearched.value = true;
  const list = await HealthApi.getHealthInfoList({ name: searchValue }).catch(() => {
    uni.$u.toast('搜索失败');
    return [] as HealthInfoItem[];
  });
  resultList.value = Array.isArray(list) ? list : [];
  loading.value = false;
}

// 页面加载时初始化搜索记录
onLoad(() => {
  loadHistory();
});

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 40rpx;
  background: #f7f8fa;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.08);
}

.back-icon {
  font-size: 28rpx;
  color: #111827;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #ffffff;
  padding: 16rpx 20rpx;
  border-radius: 999rpx;
  box-shadow: 0 12rpx 32rpx rgba(17, 24, 39, 0.08);
}

.search-icon {
  font-size: 28rpx;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 26rpx;
  color: #111827;
}

.search-action {
  font-size: 24rpx;
  color: #10b981;
  font-weight: 600;
}

.section {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.clear-btn {
  font-size: 22rpx;
  color: #9ca3af;
}

.unit-toggle {
  font-size: 20rpx;
  color: #10b981;
  background: #ecfdf5;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 20rpx;
  background: #f3f4f6;
  color: #374151;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.tag.hot {
  background: #ecfdf5;
  color: #10b981;
}

.empty-tip {
  font-size: 24rpx;
  color: #9ca3af;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-item {
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f9fafb;
  color: #1f2937;
}

.result-name {
  font-size: 26rpx;
  font-weight: 600;
}

.result-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12rpx;
}

.result-energy {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  color: #10b981;
}

.energy-value {
  font-size: 26rpx;
  font-weight: 700;
}

.energy-unit {
  font-size: 20rpx;
}

.result-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #9ca3af;
}

.result-metrics {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.metric {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  font-size: 22rpx;
  color: #4b5563;
}

.metric-label {
  color: #9ca3af;
}

.metric-value {
  font-weight: 600;
  color: #111827;
}

.metric-unit {
  font-size: 20rpx;
  color: #9ca3af;
}
</style>
