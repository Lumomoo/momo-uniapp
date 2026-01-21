<template>
  <view v-if="modalMounted" class="active-log-modal-overlay" @tap="handleOverlayClose">
    <view class="active-log-modal-panel" :class="{ 'is-active': modalVisible }" @tap.stop>
      <view class="modal-header">
        <view class="modal-header-space" />
        <view class="modal-title">
          {{ modalTitle }}
        </view>
        <view class="modal-close" @tap="handleOverlayClose">
          <text class="modal-close-text">
            ×
          </text>
        </view>
      </view>

      <view class="modal-body">
        <view v-if="isDiet" class="field-block">
          <view class="field-label">
            选择食物
          </view>
          <view class="field-picker food-picker-trigger" @tap="openFoodPicker">
            <view class="field-value">
              <text :class="{ 'food-placeholder': !selectedFoodName }">
                {{ selectedFoodLabel }}
              </text>
              <text class="tn-icon-right field-icon" />
            </view>
          </view>
        </view>

        <view v-else class="field-block">
          <view class="field-label">
            选择运动
          </view>
          <picker class="field-picker" :range="exerciseOptions" range-key="name" @change="handleExerciseChange">
            <view class="field-value">
              <text>{{ exerciseLabel }}</text>
              <text class="field-icon tn-icon-down" />
            </view>
          </picker>
        </view>

        <view v-if="showSnackPicker" class="field-block">
          <view class="field-label">
            加餐时段
          </view>
          <picker class="field-picker" :range="snackOptions" range-key="label" @change="handleSnackChange">
            <view class="field-value">
              <text>{{ snackLabel }}</text>
              <text class="tn-icon-down field-icon" />
            </view>
          </picker>
        </view>

        <view v-if="isDiet" class="field-block">
          <view class="field-label">
            食用分量（克）
          </view>
          <view class="field-input">
            <input
              class="field-input-control"
              type="digit"
              :value="foodAmountInput"
              placeholder="请输入食用分量"
              @input="handleFoodAmountInput"
            >
            <text class="field-unit">
              g
            </text>
          </view>
        </view>

        <view v-else class="field-block">
          <view class="field-label">
            运动时长（分钟）
          </view>
          <view class="field-input">
            <input
              class="field-input-control"
              type="digit"
              :value="exerciseAmountInput"
              placeholder="请输入运动时长"
              @input="handleExerciseAmountInput"
            >
            <text class="field-unit">
              min
            </text>
          </view>
        </view>
      </view>

      <view class="modal-actions">
        <view class="cancel modal-btn" @tap="handleOverlayClose">
          取消
        </view>
        <view class="modal-btn confirm" @tap="handleSave">
          保存记录
        </view>
      </view>
    </view>

    <view
      v-if="foodPickerMounted"
      class="food-picker-overlay"
      @tap.stop="handleFoodPickerClose"
    >
      <view class="active-log-modal-panel food-picker-panel" :class="{ 'is-active': foodPickerVisible }" @tap.stop>
        <view class="modal-header">
          <view class="modal-header-space" />
          <view class="modal-title">
            选择食物
          </view>
          <view class="modal-close" @tap="handleFoodPickerClose">
            <text class="modal-close-text">
              ×
            </text>
          </view>
        </view>

        <view class="modal-body">
          <view class="food-selector">
            <view class="food-search">
              <text class="tn-icon-search food-search-icon" />
              <input
                class="food-search-input"
                type="text"
                :value="foodSearchKeyword"
                placeholder="搜索食物名称"
                @input="handleFoodSearchInput"
              >
            </view>
            <view class="food-panel">
              <scroll-view class="food-category-list" scroll-y>
                <view
                  v-for="category in foodCategories"
                  :key="category.id ?? category.name"
                  class="food-category-item"
                  :class="{ active: category.id === selectedCategoryId }"
                  @tap="handleCategorySelect(category)"
                >
                  <text>{{ category.name || '未分类' }}</text>
                </view>
                <view v-if="!foodCategories.length" class="food-empty">
                  暂无分类
                </view>
              </scroll-view>
              <scroll-view class="food-list" scroll-y>
                <view
                  v-for="food in foodList"
                  :key="food.id ?? food.name"
                  class="food-item"
                  :class="{ active: food.id === foodPickerSelectedId }"
                  @tap="handleFoodPickerSelect(food)"
                >
                  <text class="food-item-name">
                    {{ food.name || '未知食物' }}
                  </text>
                  <text class="food-item-sub">
                    {{ food.categoryName || '未分类' }}
                  </text>
                </view>
                <view v-if="!foodList.length" class="food-empty">
                  暂无食物
                </view>
              </scroll-view>
            </view>
          </view>
        </view>

        <view class="modal-actions">
          <view class="modal-btn cancel" @tap="handleFoodPickerClose">
            取消
          </view>
          <view class="modal-btn confirm" @tap="handleFoodPickerConfirm">
            确定
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HealthCategoryItem, HealthInfoItem, HealthMetItem, UserActiveLog } from '@/api/health/types';
import { HealthApi } from '@/api';

interface SnackOption {
  label: string;
  value: number;
}

interface PickerOption {
  id: number | string;
  name: string;
}

interface SavePayload {
  foodId?: number;
  exerciseId?: number;
  activeType: number;
  mealType?: number;
  foodAmount?: number;
  exerciseAmount?: number;
  totalCalories?: number;
}

const props = withDefaults(defineProps<{
  visible: boolean;
  activeType?: number;
  mealType?: number;
  title?: string;
  showSnackPicker?: boolean;
  record?: UserActiveLog | null;
}>(), {
  visible: false,
  activeType: 1,
  mealType: 1,
  title: '',
  showSnackPicker: false,
  record: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', payload: SavePayload): void;
}>();

const modalVisible = ref(false);
const modalMounted = ref(false);
const modalOpenDelayMs = 40;
const modalTransitionMs = 300;
const modalOpenTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const modalCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const foodPickerVisible = ref(false);
const foodPickerMounted = ref(false);
const foodPickerOpenDelayMs = 40;
const foodPickerTransitionMs = 300;
const foodPickerOpenTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const foodPickerCloseTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const selectedSnackType = ref(props.mealType);
const foodAmountInput = ref('');
const exerciseAmountInput = ref('');
const foodCategories = ref<HealthCategoryItem[]>([]);
const foodList = ref<HealthInfoItem[]>([]);
const exerciseOptions = ref<PickerOption[]>([]);
const selectedCategoryId = ref<number | string | null>(null);
const selectedFoodId = ref<number | string | null>(null);
const foodPickerSelectedId = ref<number | string | null>(null);
const selectedFoodSnapshot = ref<HealthInfoItem | null>(null);
const selectedExerciseId = ref<number | string | null>(null);
const foodSearchKeyword = ref('');
let foodSearchTimer: ReturnType<typeof setTimeout> | null = null;
const snackOptions = [
  { label: '早加餐', value: 2 },
  { label: '午加餐', value: 4 },
  { label: '晚加餐', value: 6 },
] as SnackOption[];

const isDiet = computed(() => props.activeType === 1);

const showSnackPicker = computed(() => {
  return isDiet.value && props.showSnackPicker;
});

const snackLabel = computed(() => {
  const match = snackOptions.find(item => item.value === selectedSnackType.value);
  return match?.label || '请选择';
});

const exerciseLabel = computed(() => {
  const match = exerciseOptions.value.find(item => item.id === selectedExerciseId.value);
  return match?.name || '请选择';
});

const selectedFood = computed(() => {
  return foodList.value.find(item => item.id === selectedFoodId.value) || selectedFoodSnapshot.value || null;
});

const selectedFoodName = computed(() => {
  if (selectedFood.value?.name)
    return selectedFood.value.name;
  if (selectedFood.value?.foodName)
    return selectedFood.value.foodName;
  const recordFoodId = props.record?.foodId;
  if (recordFoodId != null && selectedFoodId.value != null && String(recordFoodId) === String(selectedFoodId.value))
    return props.record?.foodName || '';
  return '';
});

const selectedFoodLabel = computed(() => {
  return selectedFoodName.value || '请选择';
});

const modalTitle = computed(() => {
  if (props.title)
    return props.title;
  return isDiet.value ? '记录饮食' : '记录运动';
});

/**
 * 初始化弹窗状态
 */
function syncModalVisibleState() {
  if (props.visible) {
    openModal();
    return;
  }
  closeModal();
}

/**
 * 打开弹窗
 */
function openModal() {
  if (modalCloseTimer.value) {
    clearTimeout(modalCloseTimer.value);
    modalCloseTimer.value = null;
  }
  if (modalOpenTimer.value) {
    clearTimeout(modalOpenTimer.value);
    modalOpenTimer.value = null;
  }
  resetFoodPickerState();
  selectedSnackType.value = props.mealType;
  foodAmountInput.value = '';
  exerciseAmountInput.value = '';
  foodSearchKeyword.value = '';
  selectedCategoryId.value = null;
  selectedFoodId.value = null;
  selectedFoodSnapshot.value = null;
  foodPickerSelectedId.value = null;
  selectedExerciseId.value = null;
  applyRecordDefaults();
  foodPickerSelectedId.value = selectedFoodId.value;
  loadActiveOptions();
  modalMounted.value = true;
  nextTick(() => {
    modalOpenTimer.value = setTimeout(() => {
      modalVisible.value = true;
      modalOpenTimer.value = null;
    }, modalOpenDelayMs);
  });
}

/**
 * 应用编辑数据
 */
function applyRecordDefaults() {
  if (!props.record)
    return;
  if (props.record.mealType)
    selectedSnackType.value = Number(props.record.mealType);
  if (props.record.foodId)
    selectedFoodId.value = props.record.foodId;
  if (props.record.exerciseId)
    selectedExerciseId.value = props.record.exerciseId;
  if (props.record.foodAmount)
    foodAmountInput.value = String(props.record.foodAmount);
  if (props.record.exerciseAmount)
    exerciseAmountInput.value = String(props.record.exerciseAmount);
}

/**
 * 关闭弹窗
 */
function closeModal() {
  modalVisible.value = false;
  resetFoodPickerState();
  if (modalOpenTimer.value) {
    clearTimeout(modalOpenTimer.value);
    modalOpenTimer.value = null;
  }
  if (modalCloseTimer.value)
    clearTimeout(modalCloseTimer.value);
  modalCloseTimer.value = setTimeout(() => {
    modalMounted.value = false;
    modalCloseTimer.value = null;
  }, modalTransitionMs);
}

/**
 * 重置食物选择弹窗状态
 */
function resetFoodPickerState() {
  foodPickerVisible.value = false;
  foodPickerMounted.value = false;
  if (foodPickerOpenTimer.value) {
    clearTimeout(foodPickerOpenTimer.value);
    foodPickerOpenTimer.value = null;
  }
  if (foodPickerCloseTimer.value) {
    clearTimeout(foodPickerCloseTimer.value);
    foodPickerCloseTimer.value = null;
  }
  if (foodSearchTimer) {
    clearTimeout(foodSearchTimer);
    foodSearchTimer = null;
  }
}

/**
 * 打开食物选择弹窗
 */
function openFoodPicker() {
  if (!isDiet.value)
    return;
  if (foodPickerCloseTimer.value) {
    clearTimeout(foodPickerCloseTimer.value);
    foodPickerCloseTimer.value = null;
  }
  if (foodPickerOpenTimer.value) {
    clearTimeout(foodPickerOpenTimer.value);
    foodPickerOpenTimer.value = null;
  }
  foodPickerSelectedId.value = selectedFoodId.value;
  if (!foodPickerMounted.value)
    foodPickerMounted.value = true;
  nextTick(() => {
    foodPickerOpenTimer.value = setTimeout(() => {
      foodPickerVisible.value = true;
      foodPickerOpenTimer.value = null;
    }, foodPickerOpenDelayMs);
  });
  if (!foodCategories.value.length)
    loadFoodCategories();
  if (!foodList.value.length)
    fetchFoodList();
  else
    syncFoodPickerSelection();
}

/**
 * 关闭食物选择弹窗
 */
function closeFoodPicker() {
  foodPickerVisible.value = false;
  if (foodPickerOpenTimer.value) {
    clearTimeout(foodPickerOpenTimer.value);
    foodPickerOpenTimer.value = null;
  }
  if (foodSearchTimer) {
    clearTimeout(foodSearchTimer);
    foodSearchTimer = null;
  }
  if (foodPickerCloseTimer.value)
    clearTimeout(foodPickerCloseTimer.value);
  foodPickerCloseTimer.value = setTimeout(() => {
    foodPickerMounted.value = false;
    foodPickerCloseTimer.value = null;
  }, foodPickerTransitionMs);
}

/**
 * 点击关闭食物选择弹窗
 */
function handleFoodPickerClose() {
  closeFoodPicker();
}

/**
 * 确认食物选择
 */
function handleFoodPickerConfirm() {
  if (!foodPickerSelectedId.value) {
    uni.$u.toast('请选择食物');
    return;
  }
  const selected = foodList.value.find(item => item.id === foodPickerSelectedId.value) || null;
  if (!selected) {
    uni.$u.toast('请选择有效食物');
    return;
  }
  selectedFoodId.value = selected.id ?? null;
  selectedFoodSnapshot.value = selected;
  closeFoodPicker();
}

/**
 * 点击遮罩关闭弹窗
 */
function handleOverlayClose() {
  emit('update:visible', false);
}

/**
 * 加载选择列表
 */
async function loadActiveOptions() {
  if (isDiet.value) {
    await loadFoodCategories();
    await fetchFoodList();
    return;
  }
  await loadExerciseOptions();
}

/**
 * 加载食物分类
 */
async function loadFoodCategories() {
  const list = await HealthApi.getHealthCategoryList().catch(() => {
    uni.$u.toast('获取食物分类失败');
    return [];
  });
  const sorted = [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  foodCategories.value = [{ id: null, name: '全部', sortOrder: -1 }, ...sorted];
  if (selectedCategoryId.value === null || selectedCategoryId.value === undefined)
    selectedCategoryId.value = null;
}

/**
 * 获取食物列表
 */
async function fetchFoodList() {
  const keyword = foodSearchKeyword.value.trim();
  const params: Record<string, any> = {};
  if (keyword)
    params.name = keyword;
  if (selectedCategoryId.value !== null && selectedCategoryId.value !== undefined)
    params.categoryId = selectedCategoryId.value;
  const list = await HealthApi.getHealthInfoList(params).catch(() => {
    uni.$u.toast('获取食物列表失败');
    return [];
  });
  foodList.value = list;
  syncFoodPickerSelection();
  syncSelectedFoodSnapshot();
}

/**
 * 同步食物选择弹窗默认选中项
 */
function syncFoodPickerSelection() {
  if (!foodList.value.length) {
    foodPickerSelectedId.value = null;
    return;
  }
  if (foodPickerSelectedId.value && foodList.value.some(item => item.id === foodPickerSelectedId.value))
    return;
  if (selectedFoodId.value && foodList.value.some(item => item.id === selectedFoodId.value)) {
    foodPickerSelectedId.value = selectedFoodId.value;
    return;
  }
  foodPickerSelectedId.value = foodList.value[0].id ?? null;
}

/**
 * 同步已选食物详情
 */
function syncSelectedFoodSnapshot() {
  if (!selectedFoodId.value) {
    selectedFoodSnapshot.value = null;
    return;
  }
  const match = foodList.value.find(item => item.id === selectedFoodId.value);
  if (match)
    selectedFoodSnapshot.value = match;
}

/**
 * 加载运动列表
 */
async function loadExerciseOptions() {
  const list = await HealthApi.getHealthMetList().catch(() => {
    uni.$u.toast('获取运动列表失败');
    return [];
  });
  exerciseOptions.value = buildPickerOptions(list, '运动');
  if (!selectedExerciseId.value && exerciseOptions.value.length)
    selectedExerciseId.value = exerciseOptions.value[0].id;
}

/**
 * 构造下拉选项
 */
function buildPickerOptions(list: Array<HealthInfoItem | HealthMetItem>, fallbackLabel: string) {
  return list.map((item, index) => {
    const name = String((item as HealthInfoItem).name || (item as HealthMetItem).name || `${fallbackLabel}${index + 1}`);
    return {
      id: item.id ?? `${fallbackLabel}-${index}`,
      name,
    };
  });
}

/**
 * 搜索食物名称
 */
function handleFoodSearchInput(event: any) {
  foodSearchKeyword.value = event?.detail?.value ?? '';
  if (foodSearchTimer)
    clearTimeout(foodSearchTimer);
  foodSearchTimer = setTimeout(() => {
    fetchFoodList();
    foodSearchTimer = null;
  }, 300);
}

/**
 * 选择食物分类
 */
function handleCategorySelect(category: HealthCategoryItem) {
  selectedCategoryId.value = category.id ?? null;
  foodPickerSelectedId.value = null;
  fetchFoodList();
}

/**
 * 选择食物
 */
function handleFoodPickerSelect(food: HealthInfoItem) {
  foodPickerSelectedId.value = food.id ?? null;
}

/**
 * 选择运动
 */
function handleExerciseChange(event: any) {
  const index = Number(event?.detail?.value ?? 0);
  const option = exerciseOptions.value[index];
  if (option)
    selectedExerciseId.value = option.id;
}

/**
 * 选择加餐类型
 */
function handleSnackChange(event: any) {
  const index = Number(event?.detail?.value ?? 0);
  const option = snackOptions[index];
  if (option)
    selectedSnackType.value = option.value;
}

/**
 * 输入食用分量
 */
function handleFoodAmountInput(event: any) {
  foodAmountInput.value = event?.detail?.value ?? '';
}

/**
 * 输入运动时长
 */
function handleExerciseAmountInput(event: any) {
  exerciseAmountInput.value = event?.detail?.value ?? '';
}

/**
 * 保存活动记录
 */
function handleSave() {
  const payload: SavePayload = {
    activeType: props.activeType,
  };
  if (isDiet.value) {
    if (!selectedFoodId.value) {
      uni.$u.toast('请选择食物');
      return;
    }
    const foodId = Number(selectedFoodId.value);
    if (!Number.isFinite(foodId)) {
      uni.$u.toast('请选择有效食物');
      return;
    }
    const food = selectedFood.value;
    const caloriesPer100g = Number(food?.calories);
    if (!food || !Number.isFinite(caloriesPer100g)) {
      uni.$u.toast('食物热量缺失');
      return;
    }
    const amount = Number(foodAmountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      uni.$u.toast('请输入有效分量');
      return;
    }
    const totalCalories = calcFoodTotalCalories(caloriesPer100g, amount);
    payload.foodId = foodId;
    payload.foodAmount = amount;
    payload.totalCalories = totalCalories;
    payload.mealType = showSnackPicker.value ? selectedSnackType.value : props.mealType;
  }
  else {
    if (!selectedExerciseId.value) {
      uni.$u.toast('请选择运动');
      return;
    }
    const exerciseId = Number(selectedExerciseId.value);
    if (!Number.isFinite(exerciseId)) {
      uni.$u.toast('请选择有效运动');
      return;
    }
    const duration = Number(exerciseAmountInput.value);
    if (!Number.isFinite(duration) || duration <= 0) {
      uni.$u.toast('请输入有效时长');
      return;
    }
    payload.exerciseId = exerciseId;
    payload.exerciseAmount = duration;
  }
  emit('save', payload);
  emit('update:visible', false);
}

/**
 * 计算饮食热量
 */
function calcFoodTotalCalories(caloriesPer100g: number, amount: number) {
  const totalKj = caloriesPer100g * amount / 100;
  const totalKcal = totalKj / 4.184;
  return Number(totalKcal.toFixed(2));
}

watch(() => props.visible, () => {
  syncModalVisibleState();
}, { immediate: true });

watch(() => props.activeType, () => {
  if (props.visible)
    loadActiveOptions();
});

onBeforeUnmount(() => {
  if (modalOpenTimer.value)
    clearTimeout(modalOpenTimer.value);
  if (modalCloseTimer.value)
    clearTimeout(modalCloseTimer.value);
  if (foodPickerOpenTimer.value)
    clearTimeout(foodPickerOpenTimer.value);
  if (foodPickerCloseTimer.value)
    clearTimeout(foodPickerCloseTimer.value);
  if (foodSearchTimer)
    clearTimeout(foodSearchTimer);
});
</script>

<style lang="scss" scoped>
.active-log-modal-overlay {
  position: fixed;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: rgb(15 23 42 / 35%);
  inset: 0;
  backdrop-filter: blur(6px);
}

.food-picker-overlay {
  position: fixed;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: rgb(15 23 42 / 45%);
  inset: 0;
  backdrop-filter: blur(8px);
}

.active-log-modal-panel {
  padding-bottom: 32rpx;
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(100%);
}

.active-log-modal-panel.is-active {
  transform: translateY(0);
  opacity: 1;
}

.food-picker-panel {
  overflow: hidden;
  max-height: 82vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx 12rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.modal-header-space {
  width: 64rpx;
}

.modal-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #111827;
}

.modal-close {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64rpx;
  height: 64rpx;
  background: #f3f4f6;
  border-radius: 50%;
}

.modal-close-text {
  font-size: 36rpx;
  color: #9ca3af;
  line-height: 1;
}

.modal-body {
  padding: 24rpx 28rpx 0;
}

.food-selector {
  margin-bottom: 24rpx;
}

.food-search {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  margin-bottom: 16rpx;
  background: #f9fafb;
  border-radius: 18rpx;
  gap: 10rpx;
}

.food-search-icon {
  font-size: 22rpx;
  color: #9ca3af;
}

.food-search-input {
  flex: 1;
  font-size: 24rpx;
  color: #111827;
}

.food-panel {
  display: flex;
  overflow: hidden;
  height: 360rpx;
  background: #fff;
  border: 1rpx solid #f3f4f6;
  border-radius: 20rpx;
}

.food-category-list {
  width: 180rpx;
  background: #f3f4f6;
}

.food-category-item {
  padding: 16rpx 12rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.food-category-item.active {
  color: #111827;
  background: #fff;
  font-weight: 700;
}

.food-list {
  flex: 1;
  background: #fff;
}

.food-item {
  padding: 16rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.food-item:last-child {
  border-bottom: none;
}

.food-item.active {
  background: #ecfdf5;
}

.food-item-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #111827;
}

.food-item-sub {
  display: block;
  margin-top: 6rpx;
  font-size: 18rpx;
  color: #9ca3af;
}

.food-empty {
  padding: 20rpx 16rpx;
  font-size: 20rpx;
  text-align: center;
  color: #9ca3af;
}

.field-block {
  margin-bottom: 24rpx;
}

.field-label {
  margin-bottom: 12rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.field-picker {
  padding: 18rpx 20rpx;
  background: #f9fafb;
  border-radius: 18rpx;
}

.field-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #111827;
  font-weight: 600;
}

.food-placeholder {
  color: #9ca3af;
  font-weight: 500;
}

.field-icon {
  font-size: 20rpx;
  color: #9ca3af;
}

.field-input {
  display: flex;
  align-items: center;
  padding: 16rpx 18rpx;
  background: #f9fafb;
  border-radius: 18rpx;
  gap: 10rpx;
}

.field-input-control {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.field-unit {
  font-size: 22rpx;
  font-weight: 700;
  color: #9ca3af;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 28rpx 0;
}

.modal-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 88rpx;
  font-size: 26rpx;
  border-radius: 24rpx;
  flex: 1;
  font-weight: 700;
}

.modal-btn.cancel {
  color: #6b7280;
  background: #f3f4f6;
}

.modal-btn.confirm {
  color: #fff;
  background: #10b981;
}
</style>
