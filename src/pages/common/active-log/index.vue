<template>
  <view class="active-log-page">
    <view class="header">
      <view class="header-btn" @tap="goBack">
        <text class="tn-icon-left" />
      </view>
      <view class="today-btn" @tap="toggleCalendar">
        <text class="today-text">今天</text>
        <text :class="todayChevronClass" />
      </view>
      <view class="header-actions">
        <view class="header-btn">
          <text class="tn-icon-set" />
        </view>
      </view>
    </view>

    <scroll-view
      class="week-strip"
      scroll-x
      :scroll-into-view="activeDayId"
      :scroll-left="weekStripScrollLeft"
      scroll-with-animation
      show-scrollbar="false"
    >
      <view class="week-strip-inner">
        <view
          v-for="day in weekStripDays"
          :id="day.id"
          :key="day.id"
          class="week-day"
          :class="{ 'is-today': day.isToday }"
        >
          <text class="week-day-name">{{ day.weekLabel }}</text>
          <view class="week-day-number" :class="{ active: day.isToday }">
            {{ day.date }}
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="content">
      <view class="card">
        <view class="card-header">
          <text :class="[nutritionIconClass, 'icon-muted']" @tap="toggleNutritionCard" />
        </view>

        <view v-show="nutritionExpanded">
          <view class="energy-summary">
            <view class="energy-item">
              <text class="energy-label">饮食摄入</text>
              <text class="energy-value">{{ dietIntakeText }}</text>
            </view>

            <view class="energy-center">
              <view class="energy-ring">
                <svg class="energy-ring-svg" viewBox="0 0 100 100">
                  <circle class="energy-ring-track" cx="50" cy="50" r="42" />
                  <circle class="energy-ring-progress" cx="50" cy="50" r="42" :style="energyRingStyle" />
                  <circle v-if="showZeroProgressDot" class="energy-ring-zero-dot" cx="92" cy="50" r="3" />
                </svg>
              </view>
              <view class="energy-info">
                <text class="energy-info-label">还可以吃</text>
                <text class="energy-info-value">{{ remainingBudgetText }}</text>
                <view class="energy-info-tip">
                  推荐预算 {{ recommendedBudgetText }} <text class="tn-icon-help icon-small" />
                </view>
              </view>
            </view>

            <view class="energy-item">
              <text class="energy-label">运动消耗</text>
              <text class="energy-value">{{ exerciseConsumeText }}</text>
            </view>
          </view>

          <view class="macro-grid">
            <view class="macro-item">
              <text class="macro-title">碳水化合物</text>
              <view class="macro-bar">
                <view class="macro-bar-fill orange" />
              </view>
              <text class="macro-sub">0 / 226克</text>
            </view>
            <view class="macro-item">
              <text class="macro-title">蛋白质</text>
              <view class="macro-bar">
                <view class="macro-bar-fill blue" />
              </view>
              <text class="macro-sub">0 / 82克</text>
            </view>
            <view class="macro-item">
              <text class="macro-title">脂肪</text>
              <view class="macro-bar">
                <view class="macro-bar-fill yellow" />
              </view>
              <text class="macro-sub">0 / 46克</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-card">
        <view class="empty-avatar">
          <image src="@/static/images/logo.png" mode="aspectFill" class="empty-img" />
        </view>
        <text class="empty-text">
          记录饮食获取今日 <text class="highlight">营养分析</text> 与 <text class="highlight">饮食建议</text>
        </text>
      </view>
    </view>

    <!--<view class="float-bar">-->
    <!--  <view class="float-container">-->
    <!--    <view class="float-ai">-->
    <!--      <view class="ai-tag">AI</view>-->
    <!--      <text class="ai-text">算热量</text>-->
    <!--    </view>-->
    <!--    <view class="float-action">-->
    <!--      <text class="tn-icon-edit" />-->
    <!--      <text class="float-action-text">文字</text>-->
    <!--    </view>-->
    <!--    <view class="float-action">-->
    <!--      <text class="tn-icon-camera" />-->
    <!--      <text class="float-action-text">拍照</text>-->
    <!--    </view>-->
    <!--    <view class="float-more">-->
    <!--      <text class="tn-icon-fullscreen" />-->
    <!--    </view>-->
    <!--  </view>-->
    <!--</view>-->

    <!--<view class="bottom-nav">-->
    <!--  <view class="bottom-item">-->
    <!--    <view class="bottom-circle">-->
    <!--      <view class="bottom-dot" />-->
    <!--    </view>-->
    <!--    <text class="bottom-text">+早餐</text>-->
    <!--  </view>-->
    <!--  <view class="bottom-item">-->
    <!--    <text class="tn-icon-food" />-->
    <!--    <text class="bottom-text">+午餐</text>-->
    <!--  </view>-->
    <!--  <view class="bottom-item">-->
    <!--    <text class="tn-icon-moon" />-->
    <!--    <text class="bottom-text">+晚餐</text>-->
    <!--  </view>-->
    <!--  <view class="bottom-item">-->
    <!--    <text class="tn-icon-food" />-->
    <!--    <text class="bottom-text">+加餐</text>-->
    <!--  </view>-->
    <!--  <view class="bottom-item">-->
    <!--    <text class="tn-icon-footprint" />-->
    <!--    <text class="bottom-text">+运动</text>-->
    <!--  </view>-->
    <!--</view>-->

    <view v-if="calendarVisible" class="calendar-overlay" @tap="toggleCalendar">
      <view class="calendar-panel" @tap.stop>
        <view class="calendar-header">
          <text class="calendar-title">{{ calendarTitle }}</text>
          <view class="calendar-actions">
            <view class="calendar-btn" @tap="prevMonth">
              <text class="tn-icon-left" />
            </view>
            <view class="calendar-btn" @tap="nextMonth">
              <text class="tn-icon-right" />
            </view>
          </view>
        </view>
        <view class="calendar-week">
          <text v-for="item in weekNames" :key="item" class="calendar-week-item">{{ item }}</text>
        </view>
        <view class="calendar-grid">
          <view
            v-for="day in calendarDays"
            :key="day.key"
            class="calendar-day"
            :class="{ inactive: !day.isCurrent, today: day.isToday }"
          >
            <text>{{ day.date }}</text>
          </view>
        </view>
        <view class="calendar-footer">
          <view class="calendar-legend">
            <view class="legend-item">
              <view class="legend-dot red" />
              <text>吃多了</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot green" />
              <text>合适</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot yellow" />
              <text>吃少了</text>
            </view>
          </view>
          <view class="calendar-back" @tap="backToToday">回今天</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HealthUserProfiles } from '@/api/health/types';
import { HealthApi } from '@/api';
import { useUserStore } from '@/store';

const userStore = useUserStore();
const healthProfile = ref<HealthUserProfiles | null>(null);
const calendarVisible = ref(false);
const viewDate = ref(new Date());
const todayDate = ref(new Date());
const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
const nutritionExpanded = ref(true);
const defaultUserId = '1';
const dietIntake = ref(50);
const exerciseConsume = ref(0);
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;
const weekStripScrollLeft = ref(0);

/**
 * 页面显示时拉取用户健康档案
 */
onShow(async () => {
  await fetchHealthProfile();
  await nextTick();
  centerTodayInWeekStrip();
});

/**
 * 拉取用户健康档案
 */
async function fetchHealthProfile() {
  const userId = userStore.user_id || defaultUserId;
  const profile = await HealthApi.getHealthProfileByUserId(userId).catch(() => {
    uni.$u.toast('获取健康档案失败');
    return null;
  });
  healthProfile.value = profile;
}

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack();
}

/**
 * 切换卡片展开收起
 */
function toggleNutritionCard() {
  nutritionExpanded.value = !nutritionExpanded.value;
}

/**
 * 切换日历弹层
 */
function toggleCalendar() {
  calendarVisible.value = !calendarVisible.value;
}

/**
 * 滚动周视图让今天居中
 */
function centerTodayInWeekStrip() {
  const instance = getCurrentInstance();
  if (!instance)
    return;
  const query = uni.createSelectorQuery().in(instance.proxy);
  query.select('.week-strip').boundingClientRect();
  query.select('.week-day.is-today').boundingClientRect();
  query.exec((res) => {
    const stripRect = res?.[0];
    const todayRect = res?.[1];
    if (!stripRect || !todayRect)
      return;
    const offset = todayRect.left - stripRect.left + todayRect.width / 2 - stripRect.width / 2;
    weekStripScrollLeft.value = Math.max(offset, 0);
  });
}

/**
 * 切换到上一月
 */
function prevMonth() {
  const date = new Date(viewDate.value);
  date.setMonth(date.getMonth() - 1);
  viewDate.value = date;
}

/**
 * 切换到下一月
 */
function nextMonth() {
  const date = new Date(viewDate.value);
  date.setMonth(date.getMonth() + 1);
  viewDate.value = date;
}

/**
 * 回到当前日期
 */
function backToToday() {
  viewDate.value = new Date(todayDate.value);
}

/**
 * 获取月份标题
 */
const calendarTitle = computed(() => {
  const date = viewDate.value;
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
});

/**
 * 生成周滑条数据
 */
const weekStripDays = computed(() => {
  const date = new Date(todayDate.value);
  const year = date.getFullYear();
  const month = date.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const list = [] as Array<{ id: string; date: number; weekLabel: string; isToday: boolean }>;
  for (let i = 1; i <= total; i += 1) {
    const itemDate = new Date(year, month, i);
    const isToday = itemDate.toDateString() === date.toDateString();
    list.push({
      id: `day-${year}-${month}-${i}`,
      date: i,
      weekLabel: weekNames[itemDate.getDay()],
      isToday,
    });
  }
  return list;
});

/**
 * 获取当前激活日期 id
 */
const activeDayId = computed(() => {
  const today = weekStripDays.value.find(item => item.isToday);
  return today ? today.id : '';
});

/**
 * 获取日历数据
 */
const calendarDays = computed(() => {
  const date = viewDate.value;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const list: Array<{ key: string; date: number; isCurrent: boolean; isToday: boolean }> = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    list.push({
      key: `prev-${i}`,
      date: prevMonthLastDate - i,
      isCurrent: false,
      isToday: false,
    });
  }

  for (let i = 1; i <= lastDate; i += 1) {
    const current = new Date(year, month, i);
    const isToday = current.toDateString() === todayDate.value.toDateString();
    list.push({
      key: `current-${i}`,
      date: i,
      isCurrent: true,
      isToday,
    });
  }

  const totalCells = 42;
  const remaining = totalCells - list.length;
  for (let i = 1; i <= remaining; i += 1) {
    list.push({
      key: `next-${i}`,
      date: i,
      isCurrent: false,
      isToday: false,
    });
  }
  return list;
});

/**
 * 获取今天按钮图标样式
 */
const todayChevronClass = computed(() => {
  return calendarVisible.value ? 'tn-icon-up icon-small' : 'tn-icon-down icon-small';
});

/**
 * 获取卡片图标样式
 */
const nutritionIconClass = computed(() => {
  return nutritionExpanded.value ? 'tn-icon-up' : 'tn-icon-down';
});

/**
 * 推荐预算数值
 */
const recommendedBudget = computed(() => {
  const stats = healthProfile.value?.userHealthStats;
  const birthday = healthProfile.value?.birthday;
  if (!stats?.weight || !stats?.height || !birthday)
    return null;
  const age = getAgeByBirthday(birthday);
  if (age === null)
    return null;
  const gender = healthProfile.value?.gender;
  const genderOffset = getGenderOffset(gender);
  const value = 9.99 * stats.weight + 6.25 * stats.height - 4.92 * age + genderOffset;
  return Math.round(value);
});

/**
 * 推荐预算文本
 */
const recommendedBudgetText = computed(() => {
  const value = recommendedBudget.value;
  return value === null ? '--' : String(value);
});

/**
 * 饮食摄入文本
 */
const dietIntakeText = computed(() => {
  return String(dietIntake.value);
});

/**
 * 运动消耗文本
 */
const exerciseConsumeText = computed(() => {
  return String(exerciseConsume.value);
});

/**
 * 计算净摄入热量
 */
const netCalories = computed(() => {
  return dietIntake.value - exerciseConsume.value;
});

/**
 * 计算圆环进度比例
 */
const ringProgress = computed(() => {
  const budget = recommendedBudget.value;
  if (!budget || budget <= 0)
    return 0;
  const ratio = netCalories.value / budget;
  if (Number.isNaN(ratio))
    return 0;
  return Math.min(Math.max(ratio, 0), 1);
});

/**
 * 圆环进度样式
 */
const energyRingStyle = computed(() => {
  const offset = ringCircumference * (1 - ringProgress.value);
  return {
    strokeDasharray: `${ringCircumference} ${ringCircumference}`,
    strokeDashoffset: `${offset}`,
  };
});

/**
 * 进度为 0 时显示圆点
 */
const showZeroProgressDot = computed(() => {
  return ringProgress.value <= 0;
});

/**
 * 剩余推荐预算数值
 */
const remainingBudget = computed(() => {
  const budget = recommendedBudget.value;
  if (budget === null)
    return null;
  const remaining = budget - netCalories.value;
  return Math.max(Math.round(remaining), 0);
});

/**
 * 剩余推荐预算文本
 */
const remainingBudgetText = computed(() => {
  const value = remainingBudget.value;
  return value === null ? '--' : String(value);
});

/**
 * 解析生日并计算年龄
 */
function getAgeByBirthday(value: string) {
  const date = parseDate(value);
  if (!date)
    return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate()))
    age -= 1;
  return Math.max(age, 0);
}

/**
 * 获取性别参数
 */
function getGenderOffset(gender?: number) {
  if (gender === 1)
    return 5;
  if (gender === 2)
    return -161;
  return 0;
}

/**
 * 解析日期字符串
 */
function parseDate(value: string) {
  const normalized = value.replace(/-/g, '/');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime()))
    return null;
  return date;
}
</script>

<style lang="scss" scoped>
.active-log-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 200rpx;
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: #ffffff;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.header-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f2937;
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 28rpx;
  background: #f3f4f6;
  border-radius: 999rpx;
  color: #374151;
  font-weight: 600;
}

.today-text {
  font-size: 24rpx;
}

.week-strip {
  padding: 12rpx 0 8rpx;
}

.week-strip-inner {
  display: flex;
  padding: 0 28rpx;
  gap: 20rpx;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.week-day-name {
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 8rpx;
}

.week-day-number {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #374151;
  font-weight: 600;
}

.week-day-number.active {
  background: #b3f0d5;
  color: #065f46;
}

.content {
  padding: 0 28rpx 40rpx;
}

.card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.header-group {
  display: flex;
  gap: 20rpx;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 20rpx;
  color: #374151;
}

.badge-text {
  font-size: 18rpx;
  color: #3b82f6;
  background: #dbeafe;
  padding: 2rpx 6rpx;
  border-radius: 6rpx;
}

.emoji {
  font-size: 20rpx;
}

.icon-small {
  font-size: 20rpx;
}

.icon-muted {
  font-size: 24rpx;
  color: #d1d5db;
  margin-left: auto;
}

.energy-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.energy-item {
  width: 120rpx;
  text-align: center;
}

.energy-label {
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 8rpx;
}

.energy-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
}

.energy-center {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy-ring {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy-ring-svg {
  width: 200rpx;
  height: 200rpx;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.energy-ring-track {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 12;
}

.energy-ring-progress {
  fill: none;
  stroke: #10b981;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.energy-ring-zero-dot {
  fill: #10b981;
}

.energy-info {
  text-align: center;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.energy-info-label {
  font-size: 18rpx;
  color: #1f2937;
  font-weight: 600;
}

.energy-info-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
}

.energy-info-tip {
  font-size: 15rpx;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.macro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.macro-item {
  text-align: center;
}

.macro-title {
  font-size: 22rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12rpx;
}

.macro-bar {
  width: 100%;
  height: 10rpx;
  background: #f3f4f6;
  border-radius: 999rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
}

.macro-bar-fill {
  width: 0;
  height: 100%;
  border-radius: 999rpx;
}

.macro-bar-fill.orange {
  background: #fdba74;
}

.macro-bar-fill.blue {
  background: #bfdbfe;
}

.macro-bar-fill.yellow {
  background: #fde68a;
}

.macro-sub {
  font-size: 18rpx;
  color: #9ca3af;
}

.empty-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  text-align: center;
  border: 2rpx dashed #f3f4f6;
}

.empty-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24rpx;
}

.empty-img {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.3;
  border-radius: 50%;
  filter: grayscale(1) blur(2px);
}

.empty-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.highlight {
  color: #64b58f;
}

.float-bar {
  position: fixed;
  left: 50%;
  bottom: 160rpx;
  transform: translateX(-50%);
  width: 90%;
  z-index: 30;
}

.float-container {
  background: rgba(179, 240, 213, 0.9);
  border-radius: 999rpx;
  padding: 12rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.1);
}

.float-ai {
  background: #ffffff;
  border-radius: 999rpx;
  padding: 10rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.ai-tag {
  background: #1f2937;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  padding: 2rpx 6rpx;
  border-radius: 6rpx;
}

.ai-text {
  color: #065f46;
  font-weight: 700;
  font-size: 24rpx;
}

.float-action {
  flex: 1;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 999rpx;
  padding: 8rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #065f46;
  font-size: 22rpx;
}

.float-action-text {
  font-weight: 600;
}

.float-more {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(6, 95, 70, 0.6);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 2rpx solid #f3f4f6;
  padding: 16rpx 20rpx calc(env(safe-area-inset-bottom) + 10rpx);
  display: flex;
  justify-content: space-between;
  z-index: 20;
}

.bottom-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  color: #6b7280;
  font-size: 20rpx;
}

.bottom-circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 2rpx solid #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 2rpx solid #1f2937;
}

.bottom-text {
  font-size: 18rpx;
}

.calendar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  z-index: 60;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.calendar-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 0 0 40rpx 40rpx;
  padding: 24rpx 32rpx 32rpx;
  box-shadow: 0 24rpx 40rpx rgba(15, 23, 42, 0.15);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.calendar-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}

.calendar-actions {
  display: flex;
  gap: 12rpx;
}

.calendar-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 12rpx;
}

.calendar-week-item {
  padding: 8rpx 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12rpx 0;
  margin-bottom: 24rpx;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  color: #374151;
  font-size: 24rpx;
  font-weight: 600;
}

.calendar-day.inactive {
  color: #e5e7eb;
}

.calendar-day.today {
  color: #ffffff;
  background: #fb923c;
  border-radius: 999rpx;
  width: 56rpx;
  margin: 0 auto;
}

.calendar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-legend {
  display: flex;
  gap: 16rpx;
  font-size: 18rpx;
  color: #6b7280;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

.legend-dot.red {
  background: #f87171;
}

.legend-dot.green {
  background: #34d399;
}

.legend-dot.yellow {
  background: #facc15;
}

.calendar-back {
  padding: 10rpx 24rpx;
  background: #ffedd5;
  color: #fb923c;
  font-size: 20rpx;
  font-weight: 700;
  border-radius: 999rpx;
}
</style>
