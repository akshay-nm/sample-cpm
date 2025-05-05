import { ReactNode } from "react";

type CPMContainerProps = {
  totalWidth: number;
  children: ReactNode;
};

export default function CPMContainer({
  totalWidth,
  children,
}: CPMContainerProps) {
  return (
    <div className="overflow-x-hidden w-full bg-white rounded shadow border">
      <div
        className="relative"
        style={{
          width: totalWidth,
          minHeight: "80vh", // or customize as needed
        }}
      >
        {children}
      </div>
    </div>
  );
}
