"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ThemeSync() {
    const theme = useStore((state) => state.settings.theme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return null;
}
