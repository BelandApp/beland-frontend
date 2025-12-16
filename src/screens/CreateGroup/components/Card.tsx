import React from "react";
import { View } from "react-native";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <View
      className={`bg-white rounded-2xl p-5 border border-beland-border shadow-soft ${className}`}
    >
      {children}
    </View>
  );
};

export default Card;
