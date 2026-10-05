"use client";
import React from "react";

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("/sbd_logo.jpg")}
    />
  );
};
