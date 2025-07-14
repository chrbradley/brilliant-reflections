// ABOUTME: Functional UI component creation and manipulation
// ABOUTME: Pure functions for creating control configurations

/**
 * Slider configuration
 */
export interface SliderConfig {
  element: HTMLInputElement;
  min: number;
  max: number;
  value: number;
}

/**
 * Dropdown configuration
 */
export interface DropdownConfig {
  element: HTMLSelectElement;
  options: string[];
  value: string;
}

/**
 * Button configuration
 */
export interface ButtonConfig {
  element: HTMLButtonElement;
  text: string;
}

/**
 * Creates a slider configuration
 * 
 * @param id - Element ID
 * @param min - Minimum value
 * @param max - Maximum value
 * @param value - Initial value
 * @returns Immutable slider configuration
 */
export const createSlider = (
  id: string,
  min: number,
  max: number,
  value: number
): SliderConfig => {
  const element = document.getElementById(id) as HTMLInputElement;
  
  if (!element) {
    throw new Error(`Slider element with id "${id}" not found`);
  }
  
  // Configure element
  element.min = min.toString();
  element.max = max.toString();
  element.value = value.toString();
  
  return Object.freeze({
    element,
    min,
    max,
    value,
  });
};

/**
 * Creates a dropdown configuration
 * 
 * @param id - Element ID
 * @param options - Available options
 * @param value - Initial value
 * @returns Immutable dropdown configuration
 */
export const createDropdown = (
  id: string,
  options: string[],
  value: string
): DropdownConfig => {
  const element = document.getElementById(id) as HTMLSelectElement;
  
  if (!element) {
    throw new Error(`Dropdown element with id "${id}" not found`);
  }
  
  // Set initial value
  element.value = value;
  
  return Object.freeze({
    element,
    options: [...options], // Copy array to ensure immutability
    value,
  });
};

/**
 * Creates a button configuration
 * 
 * @param id - Element ID
 * @param text - Button text
 * @returns Immutable button configuration
 */
export const createButton = (
  id: string,
  text: string
): ButtonConfig => {
  const element = document.getElementById(id) as HTMLButtonElement;
  
  if (!element) {
    throw new Error(`Button element with id "${id}" not found`);
  }
  
  // Set button text
  element.textContent = text;
  
  return Object.freeze({
    element,
    text,
  });
};

/**
 * Gets current slider value
 * 
 * @param slider - Slider configuration
 * @returns Current numeric value
 */
export const getSliderValue = (slider: SliderConfig): number => {
  return parseInt(slider.element.value, 10);
};

/**
 * Gets current dropdown value
 * 
 * @param dropdown - Dropdown configuration
 * @returns Current selected value
 */
export const getDropdownValue = (dropdown: DropdownConfig): string => {
  return dropdown.element.value;
};

/**
 * Updates slider display element
 * 
 * @param slider - Slider configuration
 * @param displayId - ID of element to update
 */
export const updateSliderDisplay = (
  slider: SliderConfig,
  displayId: string
): void => {
  const display = document.getElementById(displayId);
  if (display) {
    display.textContent = getSliderValue(slider).toString();
  }
};