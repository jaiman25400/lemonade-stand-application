import { router } from "expo-router";

/**
 * Navigation helpers for the customer stack (Menu → Cart → Confirmation).
 *
 * Do not use `router.replace("/")` while Menu is still underneath the current
 * screen. Replace swaps only the *top* route, so [index, confirmation] becomes
 * [index, index]. The top Menu then shows a Back chevron to the leftover Menu.
 */

function dismissToRoot(): void {
  if (router.canDismiss()) {
    router.dismissAll();
  }
}

export function resetToConfirmation(params: {
  confirmationNumber: string;
  total: string;
}): void {
  dismissToRoot();
  router.replace({
    pathname: "/confirmation",
    params,
  });
}

export function resetToMenu(): void {
  dismissToRoot();
  router.replace("/");
}

export function popOrResetToMenu(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  resetToMenu();
}
