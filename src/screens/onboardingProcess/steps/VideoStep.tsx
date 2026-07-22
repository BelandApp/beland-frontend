import React from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { VideoPlayer, VideoView, useVideoPlayer } from "expo-video";
import { View } from "react-native";
const videoUrl =
  "blob:https://geo.dailymotion.com/3b8b0286-16b2-43b1-920b-360da32594d6";
export const VideoStep: React.FC = () => {
  const { next, indexState } = useOnboardingContext();

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.play();
    player.volume = 1;
  });
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={<Button title="Continuar" variant="primary" onPress={next} />}
    >
      <Step
        title="Aquí te explicamos paso a paso"
        subtitle="Igual... es super intuitivo!"
      >
        <View className="w-full overflow-hidden rounded-2xl shadow shadow-beland-orange-500">
          <VideoView
            player={player}
            contentFit="cover"
            allowsFullscreen={false}
            style={{
              width: "100%",
            }}
            allowsPictureInPicture
            nativeControls
          />
        </View>
      </Step>
    </StepLayout>
  );
};

export default VideoStep;
