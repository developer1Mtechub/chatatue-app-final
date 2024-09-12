import { resetNavigation } from "./resetNavigation";

export const createDelayedNavigation = (navigation, screen, params = {}, delay = 3000,) => {
    return () => {
        const timer = setTimeout(() => {
            resetNavigation(navigation, screen, params);
        }, delay);
        return () => clearTimeout(timer);
    };
};