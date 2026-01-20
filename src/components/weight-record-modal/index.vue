<template>
  <view v-if="modalMounted" class="weight-modal-overlay" @tap="handleOverlayClose">
    <view class="weight-modal-panel" :class="{ 'is-active': modalVisible }" @tap.stop>
      <view class="modal-header">
        <view class="modal-header-space" />
        <view class="modal-date" @tap="openDatetimePicker">
          <text class="modal-date-text">{{ modalDateText }}</text>
          <text class="modal-time-text">{{ modalTimeText }}</text>
          <text class="tn-icon-down modal-date-icon" />
        </view>
        <view class="modal-close" @tap="handleOverlayClose">
          <text class="modal-close-text">×</text>
        </view>
      </view>

      <view class="modal-body">
        <view class="modal-weight">
          <text class="modal-weight-value">{{ modalWeightText }}</text>
          <view class="modal-unit">
            <view class="unit-btn" :class="{ active: modalUnit === 'jin' }" @tap="setModalUnit('jin')">斤</view>
            <view class="unit-btn" :class="{ active: modalUnit === 'kg' }" @tap="setModalUnit('kg')">公斤</view>
          </view>
        </view>

        <view v-if="manualInputVisible" class="manual-input">
          <input
            class="manual-input-field"
            type="digit"
            :value="manualWeightInput"
            @input="handleManualInput"
            placeholder="输入体重"
          />
          <text class="manual-input-unit">{{ modalUnitLabel }}</text>
        </view>

        <view v-else class="ruler-wrapper">
          <view class="ruler-indicator">
            <view class="indicator-triangle" />
            <view class="indicator-line" />
          </view>
          <scroll-view
            class="ruler-scroll"
            scroll-x
            :scroll-left="rulerScrollLeft"
            scroll-with-animation
            @scroll="handleRulerScroll"
          >
            <view class="ruler-inner" :style="rulerInnerStyle">
              <view
                v-for="mark in rulerMarks"
                :key="mark.key"
                class="ruler-mark"
                :style="{ width: `${rulerStepPx}px` }"
              >
                <view class="ruler-line" :class="mark.type" />
                <text v-if="mark.type === 'major' && rulerLabelSet.has(mark.value)" class="ruler-label">{{ mark.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="modal-actions">
          <view class="manual-btn" @tap="toggleManualInput">
            <text class="manual-btn-text">{{ manualInputVisible ? '划尺输入' : '键盘输入' }}</text>
          </view>
          <view class="save-btn" @tap="saveWeightRecord">保存记录</view>
        </view>
      </view>
    </view>
  </view>

  <up-datetime-picker
    v-model="datetimePickerValue"
    :show="datetimePickerVisible"
    mode="datetime"
    @confirm="handleDatetimeConfirm"
    @cancel="handleDatetimeCancel"
    @close="handleDatetimeCancel"
  />
</template>

<script setup lang="ts">
interface RulerMark {
  key: string;
  value: number;
  label: string;
  type: 'major' | 'half' | 'minor';
}

interface SavePayload {
  weight: number;
  timestamp: number;
}

const props = withDefaults(defineProps<{
  visible: boolean;
  initialWeight?: number;
  initialTimestamp?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  defaultUnit?: 'kg' | 'jin';
}>(), {
  visible: false,
  initialWeight: 0,
  initialTimestamp: 0,
  minWeightKg: 60,
  maxWeightKg: 200,
  defaultUnit: 'kg',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', payload: SavePayload): void;
}>();

const KG_TO_JIN = 2;
const RULER_STEP = 0.1;
const DEFAULT_WEIGHT = 60;
const RULER_LAYOUT_RETRY_LIMIT = 3;
const RULER_LAYOUT_RETRY_DELAY_MS = 60;
const RULER_MIN_STEP_PX = 6;
const RULER_SNAP_DELAY_MS = 120;
const RULER_SCROLL_LOCK_MS = 160;
const RULER_OFFSET_STEPS = 22;

const modalUnit = ref<'kg' | 'jin'>(props.defaultUnit);
const modalWeight = ref(0);
const modalTimestamp = ref(Date.now());
const manualInputVisible = ref(true);
const manualWeightInput = ref('');
const modalVisible = ref(false);
const modalMounted = ref(false);
const weightModalCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const weightModalOpenTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const weightModalTransitionMs = 450;
const weightModalOpenDelayMs = 40;
const rulerScrollLeft = ref(0);
const rulerSidePadding = ref(0);
const rulerStepPx = ref(8);
const datetimePickerVisible = ref(false);
const datetimePickerValue = ref(0);
let rulerScrollLocked = false;
let rulerScrollLockTimer: ReturnType<typeof setTimeout> | null = null;
let rulerSnapTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 初始化弹窗显示状态
 */
function syncModalVisibleState() {
  if (props.visible) {
    openWeightModal();
    return;
  }
  closeWeightModal();
}

/**
 * 打开记录体重弹窗
 */
function openWeightModal() {
  if (weightModalCloseTimer.value) {
    clearTimeout(weightModalCloseTimer.value);
    weightModalCloseTimer.value = null;
  }
  if (weightModalOpenTimer.value) {
    clearTimeout(weightModalOpenTimer.value);
    weightModalOpenTimer.value = null;
  }
  manualInputVisible.value = true;
  manualWeightInput.value = '';
  modalUnit.value = props.defaultUnit;
  datetimePickerVisible.value = false;
  const baseTimestamp = Number.isFinite(props.initialTimestamp) && props.initialTimestamp
    ? props.initialTimestamp
    : Date.now();
  modalTimestamp.value = baseTimestamp;
  datetimePickerValue.value = baseTimestamp;
  const baseWeight = Number.isFinite(props.initialWeight) && props.initialWeight > 0
    ? props.initialWeight
    : DEFAULT_WEIGHT;
  modalWeight.value = modalUnit.value === 'jin' ? baseWeight * KG_TO_JIN : baseWeight;
  modalWeight.value = clampWeight(modalWeight.value);
  manualWeightInput.value = modalWeight.value.toFixed(1);
  modalMounted.value = true;
  nextTick(() => {
    weightModalOpenTimer.value = setTimeout(() => {
      modalVisible.value = true;
      if (!manualInputVisible.value)
        updateRulerLayout();
      weightModalOpenTimer.value = null;
    }, weightModalOpenDelayMs);
  });
}

/**
 * 关闭记录体重弹窗
 */
function closeWeightModal() {
  modalVisible.value = false;
  if (weightModalOpenTimer.value) {
    clearTimeout(weightModalOpenTimer.value);
    weightModalOpenTimer.value = null;
  }
  if (weightModalCloseTimer.value)
    clearTimeout(weightModalCloseTimer.value);
  datetimePickerVisible.value = false;
  if (rulerSnapTimer) {
    clearTimeout(rulerSnapTimer);
    rulerSnapTimer = null;
  }
  if (rulerScrollLockTimer) {
    clearTimeout(rulerScrollLockTimer);
    rulerScrollLockTimer = null;
  }
  rulerScrollLocked = false;
  weightModalCloseTimer.value = setTimeout(() => {
    modalMounted.value = false;
    weightModalCloseTimer.value = null;
  }, weightModalTransitionMs);
}

/**
 * 点击遮罩关闭弹窗
 */
function handleOverlayClose() {
  emit('update:visible', false);
}

/**
 * 打开时间选择器
 */
function openDatetimePicker() {
  datetimePickerValue.value = modalTimestamp.value;
  datetimePickerVisible.value = true;
}

/**
 * 处理时间选择确认
 */
function handleDatetimeConfirm(event: { value: number }) {
  const timestamp = Number(event?.value);
  if (Number.isFinite(timestamp))
    modalTimestamp.value = timestamp;
  datetimePickerVisible.value = false;
}

/**
 * 关闭时间选择器
 */
function handleDatetimeCancel() {
  datetimePickerVisible.value = false;
}

/**
 * 设置体重单位
 */
function setModalUnit(unit: 'kg' | 'jin') {
  if (unit === modalUnit.value)
    return;
  const currentWeight = modalWeight.value;
  modalWeight.value = unit === 'jin'
    ? currentWeight * KG_TO_JIN
    : currentWeight / KG_TO_JIN;
  modalUnit.value = unit;
  modalWeight.value = clampWeight(modalWeight.value);
  manualWeightInput.value = modalWeight.value.toFixed(1);
  setRulerScrollToWeight(modalWeight.value);
  nextTick(() => {
    updateRulerLayout();
  });
}

/**
 * 切换键盘输入
 */
function toggleManualInput() {
  manualInputVisible.value = !manualInputVisible.value;
  if (manualInputVisible.value) {
    manualWeightInput.value = modalWeight.value.toFixed(1);
    return;
  }
  nextTick(() => {
    updateRulerLayout();
  });
}

/**
 * 输入体重数值
 */
function handleManualInput(event: any) {
  const value = event?.detail?.value ?? '';
  manualWeightInput.value = value;
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    return;
  modalWeight.value = clampWeight(parsed);
  setRulerScrollToWeight(modalWeight.value);
}

/**
 * 保存体重记录
 */
function saveWeightRecord() {
  const weightValue = modalUnit.value === 'jin' ? modalWeight.value / KG_TO_JIN : modalWeight.value;
  if (!Number.isFinite(weightValue) || weightValue <= 0) {
    uni.$u.toast('请输入有效体重');
    return;
  }
  emit('save', {
    weight: Number(weightValue.toFixed(1)),
    timestamp: modalTimestamp.value,
  });
  emit('update:visible', false);
}

/**
 * 获取体重范围
 */
function getWeightRange() {
  if (modalUnit.value === 'jin') {
    return {
      min: props.minWeightKg * KG_TO_JIN,
      max: props.maxWeightKg * KG_TO_JIN,
    };
  }
  return {
    min: props.minWeightKg,
    max: props.maxWeightKg,
  };
}

/**
 * 限制体重范围
 */
function clampWeight(value: number) {
  const range = getWeightRange();
  const limited = Math.min(Math.max(value, range.min), range.max);
  return Number(limited.toFixed(1));
}

/**
 * 更新刻度尺布局
 */
function updateRulerLayout(retryCount = 0) {
  const instance = getCurrentInstance();
  if (!instance)
    return;
  const query = uni.createSelectorQuery().in(instance.proxy);
  query.select('.ruler-scroll').boundingClientRect();
  query.exec((res) => {
    const rect = res?.[0];
    if (!rect || !rect.width) {
      if (retryCount < RULER_LAYOUT_RETRY_LIMIT) {
        setTimeout(() => {
          updateRulerLayout(retryCount + 1);
        }, RULER_LAYOUT_RETRY_DELAY_MS);
      }
      return;
    }
    const rawStep = rect.width / 50;
    const finalStep = Math.max(rawStep, RULER_MIN_STEP_PX);
    rulerStepPx.value = finalStep;
    rulerSidePadding.value = Math.max(rect.width / 2 - finalStep / 2, 0);
    setRulerScrollToWeight(modalWeight.value);
  });
}

/**
 * 设置刻度尺位置
 */
function setRulerScrollToWeight(value: number) {
  const range = getWeightRange();
  const offset = Math.max(value - range.min, 0);
  const stepPx = rulerStepPx.value || 1;
  const stepIndex = Math.round(offset / RULER_STEP);
  const scrollLeft = (stepIndex + RULER_OFFSET_STEPS) * stepPx;
  if (rulerScrollLockTimer)
    clearTimeout(rulerScrollLockTimer);
  rulerScrollLocked = true;
  rulerScrollLockTimer = setTimeout(() => {
    rulerScrollLocked = false;
    rulerScrollLockTimer = null;
  }, RULER_SCROLL_LOCK_MS);
  rulerScrollLeft.value = scrollLeft;
}

/**
 * 滑动刻度尺更新体重
 */
function handleRulerScroll(event: any) {
  const stepPx = rulerStepPx.value || 1;
  const scrollLeft = event?.detail?.scrollLeft ?? 0;
  const prevScrollLeft = rulerScrollLeft.value;
  rulerScrollLeft.value = scrollLeft;
  if (rulerScrollLocked && Math.abs(scrollLeft - prevScrollLeft) < 0.5)
    return;
  const range = getWeightRange();
  const stepIndex = Math.round(scrollLeft / stepPx) - RULER_OFFSET_STEPS;
  const value = range.min + stepIndex * RULER_STEP;
  modalWeight.value = clampWeight(value);
  if (rulerSnapTimer)
    clearTimeout(rulerSnapTimer);
  rulerSnapTimer = setTimeout(() => {
    setRulerScrollToWeight(modalWeight.value);
    rulerSnapTimer = null;
  }, RULER_SNAP_DELAY_MS);
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
 * 判断是否同一天
 */
function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

const modalWeightText = computed(() => {
  return formatWeight(modalWeight.value);
});

const modalUnitLabel = computed(() => {
  return modalUnit.value === 'jin' ? '斤' : 'kg';
});

const modalDateText = computed(() => {
  const date = new Date(modalTimestamp.value);
  return isSameDate(date, new Date())
    ? '今天'
    : `${date.getMonth() + 1}/${date.getDate()}`;
});

const modalTimeText = computed(() => {
  const date = new Date(modalTimestamp.value);
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
});

const rulerInnerStyle = computed(() => {
  return {
    paddingLeft: `${rulerSidePadding.value}px`,
    paddingRight: `${rulerSidePadding.value}px`,
  };
});

const rulerCenterValue = computed(() => {
  const stepPx = rulerStepPx.value || 1;
  const range = getWeightRange();
  const stepIndex = Math.round(rulerScrollLeft.value / stepPx) - RULER_OFFSET_STEPS;
  return clampWeight(range.min + stepIndex * RULER_STEP);
});

const rulerMarks = computed<RulerMark[]>(() => {
  const range = getWeightRange();
  const totalSteps = Math.round((range.max - range.min) / RULER_STEP);
  const list: RulerMark[] = [];
  for (let i = 0; i <= totalSteps; i += 1) {
    const value = Number((range.min + i * RULER_STEP).toFixed(1));
    const isMajor = Number.isInteger(value);
    const isHalf = !isMajor && Number.isInteger(value * 2);
    list.push({
      key: `${value}`,
      value,
      label: String(value),
      type: isMajor ? 'major' : isHalf ? 'half' : 'minor',
    });
  }
  return list;
});

const rulerLabelSet = computed(() => {
  const range = getWeightRange();
  const minValue = Math.ceil(range.min);
  const maxValue = Math.floor(range.max);
  if (maxValue < minValue)
    return new Set<number>();
  const center = Math.round(rulerCenterValue.value);
  let start = center - 2;
  let end = center + 2;
  if (start < minValue) {
    start = minValue;
    end = Math.min(start + 4, maxValue);
  }
  if (end > maxValue) {
    end = maxValue;
    start = Math.max(end - 4, minValue);
  }
  const labels = new Set<number>();
  for (let value = start; value <= end; value += 1) {
    labels.add(value);
  }
  return labels;
});

/**
 * 同步输入框体重显示
 */
watch(modalWeight, (value) => {
  if (manualInputVisible.value)
    manualWeightInput.value = value.toFixed(1);
});

watch(() => props.visible, () => {
  syncModalVisibleState();
}, { immediate: true });

onBeforeUnmount(() => {
  if (weightModalOpenTimer.value)
    clearTimeout(weightModalOpenTimer.value);
  if (weightModalCloseTimer.value)
    clearTimeout(weightModalCloseTimer.value);
  if (rulerSnapTimer)
    clearTimeout(rulerSnapTimer);
  if (rulerScrollLockTimer)
    clearTimeout(rulerScrollLockTimer);
});
</script>

<style lang="scss" scoped>
.weight-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.weight-modal-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 36rpx 36rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.45s ease, opacity 0.45s ease;
  opacity: 0;
  padding-bottom: 40rpx;
}

.weight-modal-panel.is-active {
  transform: translateY(0);
  opacity: 1;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx 12rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.modal-header-space {
  width: 64rpx;
}

.modal-date {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f3f4f6;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-weight: 700;
  color: #374151;
}

.modal-date-text {
  color: #10b981;
  font-size: 22rpx;
}

.modal-time-text {
  font-size: 22rpx;
}

.modal-date-icon {
  font-size: 20rpx;
  color: #9ca3af;
}

.modal-close {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-text {
  font-size: 36rpx;
  color: #9ca3af;
  line-height: 1;
}

.modal-body {
  padding: 28rpx;
}

.modal-weight {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.modal-weight-value {
  font-size: 72rpx;
  font-weight: 900;
  color: #10b981;
}

.modal-unit {
  display: flex;
  border: 2rpx solid #d1fae5;
  border-radius: 16rpx;
  overflow: hidden;
}

.unit-btn {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #10b981;
  background: #ffffff;
}

.unit-btn.active {
  background: #10b981;
  color: #ffffff;
}

.manual-input {
  margin-top: 12rpx;
  background: #f9fafb;
  border-radius: 18rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.manual-input-field {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}

.manual-input-unit {
  font-size: 22rpx;
  font-weight: 700;
  color: #6b7280;
}

.ruler-wrapper {
  position: relative;
  margin-top: 24rpx;
  background: #f5f7fb;
  border-radius: 24rpx;
  padding: 28rpx 0 36rpx;
  overflow: hidden;
}

.ruler-indicator {
  position: absolute;
  top: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}

.indicator-triangle {
  width: 0;
  height: 0;
  border-left: 14rpx solid transparent;
  border-right: 14rpx solid transparent;
  border-top: 20rpx solid #10b981;
}

.indicator-line {
  width: 4rpx;
  height: 72rpx;
  background: #10b981;
  border-radius: 999rpx;
  box-shadow: 0 0 8rpx rgba(16, 185, 129, 0.35);
  margin-top: -4rpx;
}

.ruler-scroll {
  width: 100%;
  height: 180rpx;
}

.ruler-inner {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  height: 100%;
  padding-bottom: 0;
}

.ruler-mark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  position: relative;
  height: 180rpx;
}

.ruler-line {
  width: 2rpx;
  background: #d1d5db;
  margin-top: 10rpx;
}

.ruler-line.minor {
  height: 24rpx;
  background: #d1d5db;
}

.ruler-line.half {
  height: 40rpx;
  background: #a3a3a3;
}

.ruler-line.major {
  height: 60rpx;
  background: #6b7280;
}

.ruler-label {
  position: absolute;
  bottom: 12rpx;
  font-size: 20rpx;
  color: #9ca3af;
  font-weight: 700;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.manual-btn {
  width: 140rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.manual-btn-text {
  font-size: 20rpx;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 2rpx;
}

.save-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 28rpx;
  background: #10b981;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 32rpx rgba(16, 185, 129, 0.35);
}
</style>
