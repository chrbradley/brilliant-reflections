// ABOUTME: Functional UI control binding system for reactive state updates
// ABOUTME: Provides pure functions to bind DOM elements to state updaters

/**
 * Bind a slider input to a state updater function
 * @param slider - The HTML input element (range type)
 * @param updater - Function to call with new numeric value
 * @returns Unbind function to remove the event listener
 */
export const bindSliderToState = (
  slider: HTMLInputElement,
  updater: (value: number) => void
): (() => void) => {
  // Create event handler
  const handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    updater(value);
  };

  // Attach event listener
  slider.addEventListener('input', handleInput);

  // Return unbind function
  return () => {
    slider.removeEventListener('input', handleInput);
  };
};

/**
 * Bind a dropdown select to a state updater function
 * @param dropdown - The HTML select element
 * @param updater - Function to call with new string value
 * @returns Unbind function to remove the event listener
 */
export const bindDropdownToState = (
  dropdown: HTMLSelectElement,
  updater: (value: string) => void
): (() => void) => {
  // Create event handler
  const handleChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    updater(target.value);
  };

  // Attach event listener
  dropdown.addEventListener('change', handleChange);

  // Return unbind function
  return () => {
    dropdown.removeEventListener('change', handleChange);
  };
};
