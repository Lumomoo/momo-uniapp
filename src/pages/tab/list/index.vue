<template>
  <view class="progress-page">
    <view v-if="isReviving" class="revive-overlay">
      <view class="revive-glow" />
    </view>

    <view class="banana-area" :class="{ 'is-reviving': isReviving }">
      <view class="banana-wrapper" :class="{ 'is-deadly': isExecuting, 'is-healing': isHealing }">
        <svg
          viewBox="0 0 400 300"
          class="banana-svg"
          :class="{ 'is-empty': progress === 0, 'is-healing': isHealing }"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFEF78" />
              <stop offset="40%" stop-color="#FFD93D" />
              <stop offset="100%" stop-color="#F7B500" />
            </linearGradient>

            <clipPath id="bananaClip">
              <path :d="bananaPath" />
            </clipPath>
          </defs>

          <path
            :d="bananaPath"
            fill="none"
            :stroke="progress === 0 ? '#94a3b8' : '#412117'"
            stroke-width="10"
            stroke-linejoin="round"
            class="banana-outline"
          />

          <path
            :d="bananaPath"
            :fill="progress === 0 ? '#f1f5f9' : '#FFF9E5'"
            class="banana-base"
          />

          <g clip-path="url(#bananaClip)">
            <rect
              x="0"
              y="0"
              :width="fillWidth"
              height="300"
              fill="url(#bananaGrad)"
              class="banana-fill"
            />
          </g>

          <ellipse cx="230" cy="140" rx="35" ry="12" fill="white" opacity="0.35" transform="rotate(-20, 230, 140)" />
          <ellipse cx="100" cy="185" rx="15" ry="6" fill="white" opacity="0.25" transform="rotate(-10, 100, 185)" />

          <path
            d="M370,145 L385,105 Q395,85 375,75 L360,85 L350,100 Z"
            :fill="progress === 0 ? '#94a3b8' : '#8E5236'"
            :stroke="progress === 0 ? '#64748b' : '#412117'"
            stroke-width="4"
            stroke-linejoin="round"
            class="banana-stem"
          />

          <path
            d="M35,210 Q25,205 25,220 Q35,225 40,215 Z"
            :fill="progress === 0 ? '#64748b' : '#412117'"
            class="banana-tail"
          />

          <g v-if="isExecuting" class="banana-danger">
            <line x1="200" y1="50" x2="200" y2="280" stroke="#ef4444" stroke-width="4" stroke-dasharray="12,12" />
          </g>
        </svg>

        <view class="progress-text">
          <text>{{ Math.round(progress) }}%</text>
        </view>
      </view>

      <view class="effects-layer">
        <view
          v-for="slash in slashes"
          :key="slash.id"
          class="slash-effect"
          :style="{ left: `${slash.x}%`, top: `${slash.y}%`, transform: `translate(-50%, -50%) rotate(${slash.rotation}deg)` }"
        >
          <view class="slash-line" />
          <view class="slash-particles">
            <view
              v-for="particle in slash.particles"
              :key="particle.id"
              class="slash-particle"
              :style="{ '--tx': `${particle.tx}px`, '--ty': `${particle.ty}px`, 'animationDelay': `${particle.delay}s` }"
            />
          </view>
        </view>

        <view
          v-for="heal in heals"
          :key="heal.id"
          class="heal-effect"
          :style="{ left: `${heal.x}%`, top: `${heal.y}%` }"
        >
          <text class="heal-plus">
            +
          </text>
          <view class="heal-particles">
            <view
              v-for="particle in heal.particles"
              :key="particle.id"
              class="heal-particle"
              :style="{ '--tx': `${particle.tx}px`, '--ty': `${particle.ty}px`, 'animationDelay': `${particle.delay}s` }"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="controls">
      <view
        class="btn btn-slash"
        :class="{ disabled: slashDisabled }"
        @tap="handleSlashTap"
      >
        <text class="btn-icon">
          斩
        </text>
        <text class="btn-text">
          斩！(SLASH)
        </text>
      </view>

      <view
        class="btn btn-heal"
        :class="{ 'disabled': healDisabled, 'is-revive': isReviveMode }"
        @tap="handleHealTap"
      >
        <text class="btn-icon">
          {{ isReviveMode ? '复' : '心' }}
        </text>
        <text class="btn-text">
          {{ healButtonText }}
        </text>
      </view>

      <view class="btn btn-reset" @tap="resetProgress">
        <text class="btn-reset-text">
          重置
        </text>
      </view>
    </view>

    <view v-if="executionPhase > 0" class="execution-overlay">
      <view class="execution-dark" :class="{ active: executionPhase >= 1 }" />
      <view class="execution-text" :class="{ active: executionPhase === 1 }">
        <text class="execution-kanji">
          斬
        </text>
        <text class="execution-sub">
          ZAN
        </text>
      </view>
      <view v-if="executionPhase === 2" class="execution-slash" />
      <view class="execution-flash" :class="{ active: executionPhase === 3 }" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface SlashParticle {
  id: number;
  tx: number;
  ty: number;
  delay: number;
}

interface SlashEffect {
  id: number;
  x: number;
  y: number;
  rotation: number;
  particles: SlashParticle[];
}

interface HealParticle {
  id: number;
  tx: number;
  ty: number;
  delay: number;
}

interface HealingEffect {
  id: number;
  x: number;
  y: number;
  particles: HealParticle[];
}

const bananaPath = 'M35,210 C80,285 320,285 370,145 L385,105 C395,85 380,75 365,80 L350,100 C340,145 280,205 200,205 C120,205 65,200 35,210 Z';
const progress = ref(0);
const slashes = ref<SlashEffect[]>([]);
const heals = ref<HealingEffect[]>([]);
const isExecuting = ref(false);
const isHealing = ref(false);
const isReviving = ref(false);
const executionPhase = ref(0);
const nextId = ref(0);
const timerHandles = new Set<ReturnType<typeof setTimeout>>();

const fillWidth = computed(() => (progress.value / 100) * 400);
const isReviveMode = computed(() => progress.value === 0);
const healButtonText = computed(() => (isReviveMode.value ? '复活 (REVIVE)' : '回血 (HEAL)'));
const slashDisabled = computed(() => progress.value >= 100 || progress.value === 0 || isReviving.value || isExecuting.value);
const healDisabled = computed(() => isExecuting.value || isReviving.value || progress.value === 100);

/**
 * 统一管理定时器，便于清理
 */
function scheduleTimeout(callback: () => void, delay: number) {
  const timer = setTimeout(() => {
    timerHandles.delete(timer);
    callback();
  }, delay);
  timerHandles.add(timer);
}

/**
 * 清理页面内所有定时器
 */
function clearAllTimers() {
  timerHandles.forEach(timer => clearTimeout(timer));
  timerHandles.clear();
}

/**
 * 构造斩击特效数据
 */
function buildSlashEffect() {
  const particles: SlashParticle[] = Array.from({ length: 5 }).map((_, index) => ({
    id: index,
    tx: (Math.random() - 0.5) * 120,
    ty: (Math.random() - 0.5) * 120,
    delay: index * 0.02,
  }));
  return {
    id: nextId.value++,
    x: 20 + Math.random() * 60,
    y: 50 + Math.random() * 25,
    rotation: Math.random() * 360,
    particles,
  } as SlashEffect;
}

/**
 * 构造回血特效数据
 */
function buildHealEffect() {
  const particles: HealParticle[] = Array.from({ length: 4 }).map((_, index) => ({
    id: index,
    tx: (Math.random() - 0.5) * 60,
    ty: -40 - Math.random() * 40,
    delay: index * 0.1,
  }));
  return {
    id: nextId.value++,
    x: 30 + Math.random() * 40,
    y: 45 + Math.random() * 20,
    particles,
  } as HealingEffect;
}

/**
 * 移除斩击特效
 */
function removeSlash(id: number) {
  slashes.value = slashes.value.filter(item => item.id !== id);
}

/**
 * 移除回血特效
 */
function removeHeal(id: number) {
  heals.value = heals.value.filter(item => item.id !== id);
}

/**
 * 触发斩击并增加进度
 */
function triggerSlash() {
  if (isReviving.value || isExecuting.value)
    return;
  const effect = buildSlashEffect();
  slashes.value = [...slashes.value, effect];
  scheduleTimeout(() => removeSlash(effect.id), 200);
  progress.value = Math.min(progress.value + 5, 100);
}

/**
 * 触发回血或复活流程
 */
function triggerHeal() {
  if (isExecuting.value || isReviving.value)
    return;
  if (progress.value === 0) {
    triggerRevive();
    return;
  }
  const effect = buildHealEffect();
  isHealing.value = true;
  heals.value = [...heals.value, effect];
  scheduleTimeout(() => removeHeal(effect.id), 800);
  progress.value = Math.min(progress.value + 10, 100);
  scheduleTimeout(() => {
    isHealing.value = false;
  }, 500);
}

/**
 * 触发复活动画
 */
function triggerRevive() {
  isReviving.value = true;
  scheduleTimeout(() => {
    progress.value = 10;
    isReviving.value = false;
  }, 1500);
}

/**
 * 启动终结斩击动画
 */
function startExecutionAnimation() {
  executionPhase.value = 0;
  scheduleTimeout(() => {
    executionPhase.value = 1;
  }, 100);
  scheduleTimeout(() => {
    executionPhase.value = 2;
  }, 1000);
  scheduleTimeout(() => {
    executionPhase.value = 3;
  }, 1300);
  scheduleTimeout(() => {
    executionPhase.value = 0;
    progress.value = 0;
    isExecuting.value = false;
  }, 2500);
}

/**
 * 重置进度与状态
 */
function resetProgress() {
  clearAllTimers();
  progress.value = 0;
  isExecuting.value = false;
  isReviving.value = false;
  isHealing.value = false;
  executionPhase.value = 0;
  slashes.value = [];
  heals.value = [];
}

/**
 * 点击斩击按钮
 */
function handleSlashTap() {
  if (slashDisabled.value)
    return;
  triggerSlash();
}

/**
 * 点击回血按钮
 */
function handleHealTap() {
  if (healDisabled.value)
    return;
  triggerHeal();
}

watch(progress, (value) => {
  if (value >= 100 && !isExecuting.value) {
    isExecuting.value = true;
    startExecutionAnimation();
  }
});

onBeforeUnmount(() => {
  clearAllTimers();
});
</script>

<style lang="scss" scoped>
.progress-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 40rpx 32rpx 56rpx;
  min-height: 100vh;
  background: #fff;
  flex-direction: column;
}

.revive-overlay {
  position: fixed;
  z-index: 90;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(250 204 21 / 20%);
  inset: 0;
}

.revive-glow {
  width: 2rpx;
  height: 2rpx;
  background: #fff;
  border-radius: 999rpx;
  box-shadow: 0 0 200px 100px rgb(255 255 255 / 90%);
  animation: revive-glow 1.5s ease-out forwards;
}

.banana-area {
  position: relative;
  margin-bottom: 48rpx;
  width: 100%;
  max-width: 680rpx;
  transition: transform 1s ease, filter 1s ease;
}

.banana-area.is-reviving {
  transform: scale(1.1);
  filter: blur(2rpx);
}

.banana-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 520rpx;
  transition: transform 0.3s ease;
}

.banana-wrapper.is-deadly {
  transform: scale(1.08) rotate(1deg);
}

.banana-wrapper.is-healing {
  transform: scale(1.04);
}

.banana-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 15px rgb(0 0 0 / 10%));
  transition: opacity 0.5s ease, filter 0.5s ease;
}

.banana-svg.is-empty {
  opacity: 0.4;
  filter: grayscale(1);
}

.banana-svg.is-healing {
  filter: drop-shadow(0 0 20px rgb(52 211 153 / 60%));
}

.banana-outline,
.banana-base,
.banana-stem,
.banana-tail {
  transition: fill 0.5s ease, stroke 0.5s ease;
}

.banana-fill {
  transition: width 0.7s ease;
}

.banana-danger {
  animation: danger-pulse 1s ease-in-out infinite;
}

.progress-text {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 72rpx;
  color: #1f2937;
  text-shadow: 0 4rpx 8rpx rgb(255 255 255 / 80%);
  inset: 0;
  font-weight: 700;
}

.effects-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.slash-effect {
  position: absolute;
  z-index: 50;
  pointer-events: none;
}

.slash-line {
  width: 600rpx;
  height: 8rpx;
  background: #fff;
  box-shadow: 0 0 30rpx #fff;
  animation: slash-line 0.2s ease-out forwards;
}

.slash-particles {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  gap: 12rpx;
}

.slash-particle {
  width: 12rpx;
  height: 12rpx;
  background: #facc15;
  border-radius: 999rpx;
  animation: slash-particle 0.3s ease-out forwards;
}

.heal-effect {
  position: absolute;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.heal-plus {
  font-size: 36rpx;
  color: #34d399;
  font-weight: 700;
  animation: heal-float 0.8s ease-out forwards;
  opacity: 0;
}

.heal-particles {
  position: absolute;
  top: 50%;
  left: 50%;
}

.heal-particle {
  position: absolute;
  width: 10rpx;
  height: 10rpx;
  background: #6ee7b7;
  border-radius: 999rpx;
  animation: heal-sparkle 0.6s ease-out forwards;
}

.controls {
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24rpx;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  color: #fff;
  border-radius: 24rpx;
  transition: transform 0.2s ease, opacity 0.2s ease;
  gap: 12rpx;
  font-weight: 700;
}

.btn:active {
  transform: scale(0.96);
}

.btn.disabled {
  color: #9ca3af;
  background: #e5e7eb;
  box-shadow: none;
}

.btn-slash {
  background: #dc2626;
  box-shadow: 0 16rpx 24rpx rgb(220 38 38 / 15%);
}

.btn-heal {
  background: #059669;
  box-shadow: 0 16rpx 24rpx rgb(16 185 129 / 15%);
}

.btn-heal.is-revive {
  background: #f59e0b;
  box-shadow: 0 16rpx 24rpx rgb(245 158 11 / 15%);
}

.btn-reset {
  padding: 0;
  width: 88rpx;
  height: 88rpx;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 24rpx;
  box-shadow: none;
}

.btn-icon {
  font-size: 26rpx;
}

.btn-text {
  font-size: 28rpx;
}

.btn-reset-text {
  font-size: 22rpx;
  font-weight: 600;
}

.execution-overlay {
  position: fixed;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  inset: 0;
  pointer-events: none;
}

.execution-dark {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.execution-dark.active {
  opacity: 0.8;
}

.execution-text {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(0.5);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.execution-text.active {
  transform: scale(1.5);
  opacity: 1;
}

.execution-kanji {
  font-size: 140rpx;
  color: #ef4444;
  font-weight: 700;
  text-shadow: 0 0 40rpx rgb(220 38 38 / 80%);
}

.execution-sub {
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #fff;
  font-weight: 700;
  letter-spacing: 4rpx;
}

.execution-slash {
  position: absolute;
  width: 150%;
  height: 16rpx;
  background: #fff;
  transform: rotate(-15deg);
  box-shadow: 0 0 50rpx rgb(255 255 255 / 90%);
  animation: massive-slash 0.4s ease-out forwards;
}

.execution-flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.execution-flash.active {
  opacity: 1;
}

@keyframes revive-glow {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    transform: scale(5);
    opacity: 1;
  }

  100% {
    transform: scale(10);
    opacity: 0;
  }
}

@keyframes danger-pulse {
  0% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.4;
  }
}

@keyframes slash-line {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }

  20% {
    transform: scaleX(1.5);
    opacity: 1;
  }

  100% {
    transform: scaleX(2);
    opacity: 0;
  }
}

@keyframes slash-particle {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }

  100% {
    transform: translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

@keyframes heal-float {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateY(-60px) scale(1.2);
    opacity: 0;
  }
}

@keyframes heal-sparkle {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

@keyframes massive-slash {
  0% {
    transform: scaleX(0) rotate(-15deg);
    opacity: 0;
  }

  10% {
    transform: scaleX(1) rotate(-15deg);
    opacity: 1;
  }

  100% {
    transform: scaleX(2) rotate(-15deg);
    opacity: 0;
  }
}
</style>
