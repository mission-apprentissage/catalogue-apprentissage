import React, { useState } from "react";
import { Text } from "@chakra-ui/react";
import { ZoomIn, ZoomOut } from "../../theme/components/icons";

export const EllipsisText = ({ maxLength = 250, children, ...args }) => {
  const [showMore, setShowMore] = useState(false);

  if (!children) return <></>;

  if (children && typeof children !== "string") {
    console.warn("Children is not a 'string'");
    return <>{children}</>;
  }

  const needsEllipsis = children.length > maxLength;
  const ellipsisText = children.slice(0, maxLength);

  return (
    <>
      <Text {...args}>{!needsEllipsis || showMore ? children : `${ellipsisText}...`}</Text>{" "}
      {needsEllipsis && (
        <Text
          onClick={() => setShowMore(!showMore)}
          fontSize={"zeta"}
          fontStyle={"italic"}
          display="inline"
          cursor={"pointer"}
          color={"grey.600"}
          title={!showMore ? "voir plus" : "voir moins"}
        >
          {!showMore ? <ZoomIn /> : <ZoomOut />}
        </Text>
      )}
    </>
  );
};
