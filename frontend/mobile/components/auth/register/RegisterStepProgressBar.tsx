import React from 'react';
import { Text, View } from 'react-native';
import { Radii, Spacing, Typography } from '../../ui';
import type { Step } from './types';

type Props = {
  T: any;
  currentStep: number;
  totalSteps: number;
  progress: number;
  steps: Step[];
  stepKey: Step;
  stepLabels: Record<Step, string>;
};

export function RegisterStepProgressBar({ T, currentStep, totalSteps, progress, steps, stepKey, stepLabels }: Props) {
  return (
    <View style={{ paddingHorizontal: Spacing['4'], paddingTop: Spacing['4'], paddingBottom: Spacing['3'], gap: Spacing['2'] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: Typography.xs, color: T.textHint }}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text style={{ fontSize: Typography.xs, color: T.primary, fontWeight: Typography.semibold as any }}>
          {stepLabels[stepKey]}
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: T.surfaceHigh, borderRadius: Radii.full, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: Radii.full, backgroundColor: T.primary, width: `${progress * 100}%` }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', marginTop: Spacing['1'], marginBottom: Spacing['8'] }}>
        {steps.map((step, index) => (
          <View
            key={step}
            style={{
              width: index === currentStep ? 20 : 6,
              height: 6,
              borderRadius: Radii.full,
              backgroundColor: index <= currentStep ? T.primary : T.surfaceHigh,
              opacity: index < currentStep ? 0.5 : 1,
            }}
          />
        ))}
      </View>
    </View>
  );
}
