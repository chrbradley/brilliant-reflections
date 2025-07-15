// ABOUTME: Tests for functional UI control binding system
// ABOUTME: Verifies event binding, state updates, and cleanup

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bindSliderToState, bindDropdownToState } from './bindControls';

describe('bindControls', () => {
  describe('bindSliderToState', () => {
    let slider: HTMLInputElement;
    let updater: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Create mock slider element
      slider = document.createElement('input');
      slider.type = 'range';
      slider.value = '5';
      updater = vi.fn();
    });

    it('should call updater when slider value changes', () => {
      const unbind = bindSliderToState(slider, updater);

      // Simulate input event
      slider.value = '7';
      const event = new Event('input', { bubbles: true });
      slider.dispatchEvent(event);

      expect(updater).toHaveBeenCalledWith(7);

      unbind();
    });

    it('should parse slider value as number', () => {
      const unbind = bindSliderToState(slider, updater);

      // Test with decimal value
      slider.value = '3.5';
      const event = new Event('input', { bubbles: true });
      slider.dispatchEvent(event);

      expect(updater).toHaveBeenCalledWith(3.5);
      expect(typeof updater.mock.calls[0][0]).toBe('number');

      unbind();
    });

    it('should return unbind function that removes event listener', () => {
      const unbind = bindSliderToState(slider, updater);

      // Unbind the listener
      unbind();

      // Simulate input event after unbinding
      slider.value = '10';
      const event = new Event('input', { bubbles: true });
      slider.dispatchEvent(event);

      // Updater should not be called
      expect(updater).not.toHaveBeenCalled();
    });

    it('should handle multiple bindings independently', () => {
      const updater1 = vi.fn();
      const updater2 = vi.fn();

      const unbind1 = bindSliderToState(slider, updater1);
      const unbind2 = bindSliderToState(slider, updater2);

      // Change value
      slider.value = '8';
      const event = new Event('input', { bubbles: true });
      slider.dispatchEvent(event);

      // Both updaters should be called
      expect(updater1).toHaveBeenCalledWith(8);
      expect(updater2).toHaveBeenCalledWith(8);

      // Unbind first updater
      unbind1();

      // Change value again
      slider.value = '9';
      const event2 = new Event('input', { bubbles: true });
      slider.dispatchEvent(event2);

      // Only second updater should be called
      expect(updater1).toHaveBeenCalledTimes(1); // Still 1 from before
      expect(updater2).toHaveBeenCalledTimes(2); // Called twice total

      unbind2();
    });
  });

  describe('bindDropdownToState', () => {
    let dropdown: HTMLSelectElement;
    let updater: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Create mock dropdown element
      dropdown = document.createElement('select');

      // Add options
      const option1 = document.createElement('option');
      option1.value = 'low';
      option1.text = 'Low';
      dropdown.add(option1);

      const option2 = document.createElement('option');
      option2.value = 'medium';
      option2.text = 'Medium';
      option2.selected = true;
      dropdown.add(option2);

      const option3 = document.createElement('option');
      option3.value = 'high';
      option3.text = 'High';
      dropdown.add(option3);

      updater = vi.fn();
    });

    it('should call updater when dropdown value changes', () => {
      const unbind = bindDropdownToState(dropdown, updater);

      // Simulate change event
      dropdown.value = 'high';
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);

      expect(updater).toHaveBeenCalledWith('high');

      unbind();
    });

    it('should return unbind function that removes event listener', () => {
      const unbind = bindDropdownToState(dropdown, updater);

      // Unbind the listener
      unbind();

      // Simulate change event after unbinding
      dropdown.value = 'low';
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);

      // Updater should not be called
      expect(updater).not.toHaveBeenCalled();
    });

    it('should handle empty values', () => {
      const unbind = bindDropdownToState(dropdown, updater);

      // Add empty option and select it
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.text = '-- Select --';
      dropdown.insertBefore(emptyOption, dropdown.firstChild);
      dropdown.value = '';

      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);

      expect(updater).toHaveBeenCalledWith('');

      unbind();
    });
  });
});
