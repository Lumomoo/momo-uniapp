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
          :class="{ 'is-today': day.isToday, 'is-active': day.isActive }"
          @tap="handleWeekDaySelect(day)"
        >
          <text class="week-day-name">{{ day.weekLabel }}</text>
          <view class="week-day-number" :class="{ active: day.isActive }">
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
                  推荐预算 {{ recommendedBudgetText }} <text class="tn-icon-help icon-small" @tap="showBmrTip" />
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
              <text class="macro-sub">{{ macroCarbohydrateText }}</text>
            </view>
            <view class="macro-item">
              <text class="macro-title">蛋白质</text>
              <view class="macro-bar">
                <view class="macro-bar-fill blue" />
              </view>
              <text class="macro-sub">{{ macroProteinText }}</text>
            </view>
            <view class="macro-item">
              <text class="macro-title">脂肪</text>
              <view class="macro-bar">
                <view class="macro-bar-fill yellow" />
              </view>
              <text class="macro-sub">{{ macroFatText }}</text>
            </view>
          </view>

          <view class="macro-foot">
            <text class="macro-sub">膳食纤维：{{ macroFiberText }}</text>
          </view>
        </view>
      </view>

      <view v-if="!activeLogs.length" class="empty-card">
        <view class="empty-avatar">
          <image src="@/static/images/logo.png" mode="aspectFill" class="empty-img" />
        </view>
        <text class="empty-text">
          记录饮食获取今日 <text class="highlight">营养分析</text> 与 <text class="highlight">饮食建议</text>
        </text>
      </view>

      <view v-else class="log-section">
        <view v-for="group in groupedLogCards" :key="group.key" class="log-card">
          <view class="log-card-title">{{ group.title }}</view>
          <view v-for="item in group.items" :key="item.id" class="log-item">
            <view class="log-item-left">
              <text class="log-item-name">{{ item.name }}</text>
              <text class="log-item-sub">{{ item.subText }}</text>
            </view>
            <view class="log-item-right">
              <text class="log-item-calories">{{ item.caloriesText }}</text>
              <text class="tn-icon-edit log-item-edit" @tap.stop="handleEditLog(item.raw)" />
            </view>
          </view>
        </view>
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
            :class="{ inactive: !day.isCurrent, today: day.isToday, active: day.isActive }"
            @tap="handleCalendarSelect(day)"
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
    <view v-if="bmrTipMounted" class="bmr-tip-overlay" @tap="closeBmrTip">
      <view class="bmr-tip-panel" :class="{ 'is-active': bmrTipVisible }" @tap.stop>
        <view class="bmr-tip-title">推荐预算说明</view>
        <view class="bmr-tip-content">
          <text>BMR = （9.99 x 体重 + 6.25 x 身高 – 4.92 x 年龄 + s ） 千卡/天</text>
          <text>在这里，体重以公斤为单位，身高以厘米为单位，年龄以年为单位。</text>
          <text>s 是调整性别的因素，男性采用值 +5，女性采用 -161 值。</text>
        </view>
      </view>
    </view>

    <ActiveLogModal
      v-model:visible="activeLogModalVisible"
      :active-type="activeLogConfig.activeType"
      :meal-type="activeLogConfig.mealType"
      :show-snack-picker="activeLogConfig.showSnackPicker"
      :title="activeLogConfig.title"
      :record="editingLog"
      @save="handleActiveLogSave"
    />
  </view>
</template>

<script setup lang="ts">
import type { ActiveLogCreatePayload, HealthActiveLogSummary, HealthUserProfiles, UserActiveLog, UserHealthStats } from '@/api/health/types';
import { HealthApi } from '@/api';
import { useUserStore } from '@/store';
import ActiveLogModal from '@/components/active-log-modal/index.vue';

const userStore = useUserStore();
const healthProfile = ref<HealthUserProfiles | null>(null);
const calendarVisible = ref(false);
const viewDate = ref(new Date());
const todayDate = ref(new Date());
const selectedDate = ref(new Date());
const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
const nutritionExpanded = ref(true);
const defaultUserId = '1';
const activeLogs = ref<UserActiveLog[]>([]);
const dietIntake = ref(0);
const exerciseConsume = ref(0);
const ringRadius = 42;
const ringCircumference = 2 * Math.PI * ringRadius;
const weekStripScrollLeft = ref(0);
const bmrTipVisible = ref(false);
const bmrTipMounted = ref(false);
const bmrTipTransitionMs = 600;
const bmrTipOpenDelayMs = 40;
const bmrTipCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const bmrTipOpenTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const activeLogModalVisible = ref(false);
const editingLog = ref<UserActiveLog | null>(null);
const activeLogConfig = ref({
  activeType: 1,
  mealType: 1,
  showSnackPicker: false,
  title: '',
});

/**
 * 页面显示时拉取用户活动汇总
 */
onShow(async () => {
  todayDate.value = new Date();
  if (!selectedDate.value)
    selectedDate.value = new Date(todayDate.value);
  await fetchActiveSummary(formatQueryDate(selectedDate.value));
  await nextTick();
  centerActiveInWeekStrip();
});

/**
 * 拉取用户活动汇总
 */
async function fetchActiveSummary(date: string) {
  const userId = userStore.user_id || defaultUserId;
  const summary = await HealthApi.getActiveLogSummary(userId, date).catch(() => {
    uni.$u.toast('获取活动记录失败');
    return null;
  });
  if (!summary) {
    await fetchHealthProfile();
    dietIntake.value = 0;
    exerciseConsume.value = 0;
    activeLogs.value = [];
    return;
  }
  applyActiveSummary(summary);
}

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
 * 应用活动汇总数据
 */
function applyActiveSummary(summary: HealthActiveLogSummary) {
  const profile = summary.userProfiles ?? healthProfile.value;
  healthProfile.value = mergeHealthStats(profile, summary.userHealthStats);
  activeLogs.value = summary.userActiveLogs || [];
  const calories = calcCaloriesByActiveLogs(activeLogs.value);
  dietIntake.value = calories.diet;
  exerciseConsume.value = calories.exercise;
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
  if (calendarVisible.value)
    viewDate.value = new Date(selectedDate.value);
}

/**
 * 滚动周视图让今天居中
 */
function centerActiveInWeekStrip() {
  const instance = getCurrentInstance();
  if (!instance)
    return;
  const query = uni.createSelectorQuery().in(instance.proxy);
  query.select('.week-strip').boundingClientRect();
  query.select('.week-day.is-active').boundingClientRect();
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
 * 计算饮食与运动热量
 */
function calcCaloriesByActiveLogs(logs: UserActiveLog[]) {
  let diet = 0;
  let exercise = 0;
  logs.forEach((item) => {
    const total = Number(item.totalCalories);
    if (!Number.isFinite(total))
      return;
    if (item.activeType === 2)
      exercise += total;
    else
      diet += total;
  });
  return {
    diet: Math.round(diet),
    exercise: Math.round(exercise),
  };
}

/**
 * 判断是否加餐类型
 */
function isSnackMealType(mealType?: number) {
  return mealType === 2 || mealType === 4 || mealType === 6;
}

/**
 * 合并健康体征信息
 */
function mergeHealthStats(profile: HealthUserProfiles | null | undefined, stats?: UserHealthStats) {
  if (!profile)
    return profile ?? null;
  if (!stats)
    return profile;
  return {
    ...profile,
    userHealthStats: {
      ...(profile.userHealthStats || {}),
      ...stats,
    },
  };
}

/**
 * 格式化查询日期
 */
function formatQueryDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const today = new Date(todayDate.value);
  viewDate.value = new Date(today);
  applySelectedDate(today);
  calendarVisible.value = false;
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
  const date = new Date(selectedDate.value);
  const year = date.getFullYear();
  const month = date.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const list = [] as Array<{ id: string; date: number; weekLabel: string; isToday: boolean; isActive: boolean; dateObj: Date }>;
  for (let i = 1; i <= total; i += 1) {
    const itemDate = new Date(year, month, i);
    const isToday = isSameDate(itemDate, todayDate.value);
    const isActive = isSameDate(itemDate, selectedDate.value);
    list.push({
      id: `day-${year}-${month}-${i}`,
      date: i,
      weekLabel: weekNames[itemDate.getDay()],
      isToday,
      isActive,
      dateObj: itemDate,
    });
  }
  return list;
});

/**
 * 获取当前激活日期 id
 */
const activeDayId = computed(() => {
  const active = weekStripDays.value.find(item => item.isActive);
  return active ? active.id : '';
});

/**
 * 获取日历数据
 */
const calendarDays = computed(() => {
  const date = viewDate.value;
  const year = date.getFullYear();
  const month = date.getMonth();
  const list: Array<{ key: string; date: number; isCurrent: boolean; isToday: boolean; isActive: boolean; dateObj: Date }> = [];
  const startOfMonth = new Date(year, month, 1);
  const startOffset = startOfMonth.getDay();
  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(year, month, 1 - startOffset + i);
    const isCurrent = cellDate.getMonth() === month;
    const isToday = isSameDate(cellDate, todayDate.value);
    const isActive = isSameDate(cellDate, selectedDate.value);
    list.push({
      key: formatDateKey(cellDate),
      date: cellDate.getDate(),
      isCurrent,
      isToday,
      isActive,
      dateObj: cellDate,
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
  const weight = Number(stats?.weight);
  const height = Number(stats?.height);
  if (!Number.isFinite(weight) || !Number.isFinite(height) || !birthday)
    return null;
  const age = getAgeByBirthday(birthday);
  if (age === null)
    return null;
  const gender = healthProfile.value?.gender;
  const genderOffset = getGenderOffset(gender);
  const value = 9.99 * weight + 6.25 * height - 4.92 * age + genderOffset;
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
 * 统计营养素总量
 */
function calcNutrientTotals(logs: UserActiveLog[]) {
  return logs
    .filter(item => item.activeType === 1)
    .reduce((acc, item) => {
      acc.protein += Number(item.protein) || 0;
      acc.fat += Number(item.fat) || 0;
      acc.carbohydrate += Number(item.carbohydrate) || 0;
      acc.fiber += Number(item.fiber) || 0;
      return acc;
    }, {
      protein: 0,
      fat: 0,
      carbohydrate: 0,
      fiber: 0,
    });
}

/**
 * 格式化营养素显示
 */
function formatMacroValue(value: number) {
  if (!Number.isFinite(value))
    return '--';
  return `${value.toFixed(1)} 克`;
}

const nutrientTotals = computed(() => {
  return calcNutrientTotals(activeLogs.value);
});

const macroProteinText = computed(() => {
  return formatMacroValue(nutrientTotals.value.protein);
});

const macroFatText = computed(() => {
  return formatMacroValue(nutrientTotals.value.fat);
});

const macroCarbohydrateText = computed(() => {
  return formatMacroValue(nutrientTotals.value.carbohydrate);
});

const macroFiberText = computed(() => {
  return formatMacroValue(nutrientTotals.value.fiber);
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
 * 获取餐次名称
 */
function getMealTypeLabel(mealType?: number) {
  const map: Record<number, string> = {
    1: '早餐',
    2: '早加餐',
    3: '午餐',
    4: '午加餐',
    5: '晚餐',
    6: '晚加餐',
  };
  if (!mealType)
    return '未分组';
  return map[mealType] || '未分组';
}

/**
 * 获取活动类型名称
 */
function getActiveTypeLabel(activeType?: number) {
  if (activeType === 1)
    return '饮食';
  if (activeType === 2)
    return '运动';
  return '未知';
}

/**
 * 格式化热量
 */
function formatCalories(value?: number | string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    return '--';
  return `${parsed.toFixed(2)} kcal`;
}

/**
 * 格式化分量
 */
function formatFoodAmount(value?: number | string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    return '--';
  return `${parsed} g`;
}

/**
 * 格式化运动时长
 */
function formatExerciseDuration(value?: number | string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    return '--';
  return `${parsed} 分钟`;
}

/**
 * 活动记录分组卡片
 */
const groupedLogCards = computed(() => {
  const groups = new Map<string, { activeType: number; mealType: number; items: UserActiveLog[] }>();
  activeLogs.value.forEach((item) => {
    const activeType = Number(item.activeType ?? 0);
    const mealType = Number(item.mealType ?? 0);
    const key = `${activeType}-${mealType}`;
    if (!groups.has(key))
      groups.set(key, { activeType, mealType, items: [] });
    groups.get(key)?.items.push(item);
  });
  return [...groups.values()]
    .sort((a, b) => (a.activeType - b.activeType) || (a.mealType - b.mealType))
    .map((group) => {
      const title = group.activeType === 1
        ? getMealTypeLabel(group.mealType)
        : '运动';
      return {
        key: `${group.activeType}-${group.mealType}`,
        title,
        items: group.items.map(item => ({
          id: item.id ?? `${group.activeType}-${group.mealType}-${item.foodId ?? item.exerciseId ?? ''}`,
          name: group.activeType === 1
            ? (item.foodName || (item.foodId ? `食物${item.foodId}` : '未知食物'))
            : '运动记录',
          subText: group.activeType === 1
            ? formatFoodAmount(item.foodAmount)
            : formatExerciseDuration(item.exerciseAmount),
          caloriesText: formatCalories(item.totalCalories),
          raw: item,
        })),
      };
    });
});

/**
 * 打开编辑弹窗
 */
function handleEditLog(record: UserActiveLog) {
  const activeType = Number(record.activeType ?? 1);
  const mealType = Number(record.mealType ?? 1);
  activeLogConfig.value = {
    activeType,
    mealType,
    showSnackPicker: activeType === 1 && isSnackMealType(mealType),
    title: activeType === 1 ? '编辑饮食' : '编辑运动',
  };
  editingLog.value = record;
  activeLogModalVisible.value = true;
}

/**
 * 保存编辑活动记录
 */
async function handleActiveLogSave(payload: ActiveLogCreatePayload) {
  const isEdit = Boolean(editingLog.value);
  const requestPayload: ActiveLogCreatePayload = { ...payload };
  if (editingLog.value?.id)
    requestPayload.id = editingLog.value.id;
  try {
    if (isEdit)
      await HealthApi.updateActiveLog(requestPayload);
    else
      await HealthApi.createActiveLog(requestPayload);
    uni.$u.toast(isEdit ? '更新成功' : '新增成功');
    await fetchActiveSummary(formatQueryDate(selectedDate.value));
  }
  catch {
    uni.$u.toast(isEdit ? '更新失败' : '新增失败');
  }
}

/**
 * 显示基础代谢公式提示
 */
function showBmrTip() {
  if (bmrTipCloseTimer.value) {
    clearTimeout(bmrTipCloseTimer.value);
    bmrTipCloseTimer.value = null;
  }
  if (bmrTipOpenTimer.value) {
    clearTimeout(bmrTipOpenTimer.value);
    bmrTipOpenTimer.value = null;
  }
  bmrTipMounted.value = true;
  nextTick(() => {
    bmrTipOpenTimer.value = setTimeout(() => {
      bmrTipVisible.value = true;
      bmrTipOpenTimer.value = null;
    }, bmrTipOpenDelayMs);
  });
}

/**
 * 关闭基础代谢公式提示
 */
function closeBmrTip() {
  bmrTipVisible.value = false;
  if (bmrTipOpenTimer.value) {
    clearTimeout(bmrTipOpenTimer.value);
    bmrTipOpenTimer.value = null;
  }
  if (bmrTipCloseTimer.value)
    clearTimeout(bmrTipCloseTimer.value);
  bmrTipCloseTimer.value = setTimeout(() => {
    bmrTipMounted.value = false;
    bmrTipCloseTimer.value = null;
  }, bmrTipTransitionMs);
}

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
  return -161;
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

/**
 * 判断是否同一天
 */
function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

/**
 * 格式化日期key
 */
function formatDateKey(date: Date) {
  return formatQueryDate(date);
}

/**
 * 切换选择日期
 */
function applySelectedDate(date: Date) {
  selectedDate.value = new Date(date);
  viewDate.value = new Date(date);
  fetchActiveSummary(formatQueryDate(selectedDate.value));
  nextTick(() => {
    centerActiveInWeekStrip();
  });
}

/**
 * 点击周视图日期
 */
function handleWeekDaySelect(day: { dateObj: Date }) {
  applySelectedDate(day.dateObj);
}

/**
 * 点击日历日期
 */
function handleCalendarSelect(day: { dateObj: Date }) {
  applySelectedDate(day.dateObj);
  calendarVisible.value = false;
}

/**
 * 弹窗关闭后清理编辑态
 */
watch(activeLogModalVisible, (value) => {
  if (!value)
    editingLog.value = null;
});
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

.macro-foot {
  margin-top: 20rpx;
  text-align: center;
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

.log-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.log-card {
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  color: #0f172a;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.06);
}

.log-card-title {
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item-name {
  font-size: 20rpx;
  color: #111827;
}

.log-item-left {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.log-item-sub {
  font-size: 18rpx;
  color: #9ca3af;
}

.log-item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.log-item-calories {
  font-size: 20rpx;
  font-weight: 700;
  color: #111827;
}

.log-item-edit {
  font-size: 22rpx;
  color: #9ca3af;
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

.calendar-day.active {
  color: #065f46;
  background: #b3f0d5;
  border-radius: 999rpx;
  width: 56rpx;
  margin: 0 auto;
}

.calendar-day.today.active {
  color: #ffffff;
  background: #fb923c;
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

.bmr-tip-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
}

.bmr-tip-panel {
  width: 560rpx;
  background: #ffffff;
  padding: 32rpx;
  border-radius: 32rpx;
  transform: translateY(70vh);
  opacity: 0;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
}

.bmr-tip-panel.is-active {
  transform: translateY(0);
  opacity: 1;
}

.bmr-tip-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20rpx;
  text-align: center;
}

.bmr-tip-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  font-size: 22rpx;
  color: #4b5563;
  line-height: 1.6;
}
</style>
