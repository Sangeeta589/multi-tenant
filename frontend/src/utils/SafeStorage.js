const lockedKeys = ["tenantId", "tenantName"];

export const SafeStorage = {
  setItem: (key, value, force = false) => {
    const storedValue = typeof value === "object" ? JSON.stringify(value) : value;
    if (force || !lockedKeys.includes(key) || localStorage.getItem(key) === null) {
      localStorage.setItem(key, storedValue);
    } else {
      console.warn(`Attempt to overwrite locked key "${key}" was blocked.`);
    }
  },
  getItem: (key, parse = false) => {
    const item = localStorage.getItem(key);
    return parse && item ? JSON.parse(item) : item;
  },
  removeItem: (key) => {
    if (!lockedKeys.includes(key)) {
      localStorage.removeItem(key);
    } else {
      console.warn(`Cannot remove locked key "${key}".`);
    }
  },
  restoreLockedFromLocalStorage: () => {
    lockedKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value && !SafeStorage.getItem(key)) {
        SafeStorage.setItem(key, value);
      }
    });
  },
};
