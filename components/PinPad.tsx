"use client";

import { Delete } from "lucide-react";

interface PinPadProps {
    onDigitPress: (digit: string) => void;
    onDelete: () => void;
    disabled?: boolean;
}

export const PinPad = ({ onDigitPress, onDelete, disabled }: PinPadProps) => {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-[350px] mx-auto">
            {digits.map((digit, index) => {
                if (digit === "") return <div key={index} />; // Spacer

                if (digit === "del") {
                    return (
                        <button
                            key={index}
                            onClick={onDelete}
                            disabled={disabled}
                            className="flex items-center justify-center h-20 w-20 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all mx-auto"
                        >
                            <Delete size={32} />
                        </button>
                    );
                }

                return (
                    <button
                        key={index}
                        onClick={() => onDigitPress(digit)}
                        disabled={disabled}
                        className="h-20 w-20 rounded-full bg-white/10 text-white text-3xl font-semibold hover:bg-white/20 active:scale-95 transition-all mx-auto"
                    >
                        {digit}
                    </button>
                );
            })}
        </div>
    );
};
