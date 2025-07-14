import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSlider,
  createDropdown,
  createButton,
  getSliderValue,
  getDropdownValue,
  updateSliderDisplay,
} from './createControls';

describe('createControls', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  describe('createSlider', () => {
    it('should return existing slider if found', () => {
      const existing = document.createElement('input');
      existing.id = 'testSlider';
      existing.type = 'range';
      document.body.appendChild(existing);
      
      const config = createSlider('testSlider', 0, 10, 5);
      
      expect(config.element).toBe(existing);
      expect(config.min).toBe(0);
      expect(config.max).toBe(10);
      expect(config.value).toBe(5);
    });

    it('should throw error if slider not found', () => {
      expect(() => createSlider('nonExistent', 0, 10, 5)).toThrow(
        'Slider element with id "nonExistent" not found'
      );
    });

    it('should configure slider attributes', () => {
      const slider = document.createElement('input');
      slider.id = 'testSlider';
      slider.type = 'range';
      document.body.appendChild(slider);
      
      createSlider('testSlider', 1, 8, 4);
      
      expect(slider.min).toBe('1');
      expect(slider.max).toBe('8');
      expect(slider.value).toBe('4');
    });

    it('should return immutable configuration', () => {
      const slider = document.createElement('input');
      slider.id = 'testSlider';
      slider.type = 'range';
      document.body.appendChild(slider);
      
      const config = createSlider('testSlider', 0, 10, 5);
      
      expect(() => {
        (config as any).value = 10;
      }).toThrow();
    });
  });

  describe('createDropdown', () => {
    it('should return existing dropdown if found', () => {
      const select = document.createElement('select');
      select.id = 'testSelect';
      const option1 = document.createElement('option');
      option1.value = 'low';
      const option2 = document.createElement('option');
      option2.value = 'high';
      option2.selected = true;
      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);
      
      const config = createDropdown('testSelect', ['low', 'high'], 'high');
      
      expect(config.element).toBe(select);
      expect(config.options).toEqual(['low', 'high']);
      expect(config.value).toBe('high');
    });

    it('should set initial value', () => {
      const select = document.createElement('select');
      select.id = 'testSelect';
      const option1 = document.createElement('option');
      option1.value = 'a';
      const option2 = document.createElement('option');
      option2.value = 'b';
      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);
      
      createDropdown('testSelect', ['a', 'b'], 'b');
      
      expect(select.value).toBe('b');
    });
  });

  describe('createButton', () => {
    it('should return existing button if found', () => {
      const button = document.createElement('button');
      button.id = 'testButton';
      button.textContent = 'Click Me';
      document.body.appendChild(button);
      
      const config = createButton('testButton', 'Click Me');
      
      expect(config.element).toBe(button);
      expect(config.text).toBe('Click Me');
    });

    it('should set button text', () => {
      const button = document.createElement('button');
      button.id = 'testButton';
      document.body.appendChild(button);
      
      createButton('testButton', 'Reset');
      
      expect(button.textContent).toBe('Reset');
    });
  });

  describe('getSliderValue', () => {
    it('should return current slider value as number', () => {
      const slider = document.createElement('input');
      slider.id = 'testSlider';
      slider.type = 'range';
      document.body.appendChild(slider);
      
      const config = createSlider('testSlider', 0, 10, 5);
      // Change the value after creating the config
      slider.value = '7';
      const value = getSliderValue(config);
      
      expect(value).toBe(7);
      expect(typeof value).toBe('number');
    });
  });

  describe('getDropdownValue', () => {
    it('should return current dropdown value', () => {
      const select = document.createElement('select');
      select.id = 'testSelect';
      const option1 = document.createElement('option');
      option1.value = 'low';
      const option2 = document.createElement('option');
      option2.value = 'high';
      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);
      
      const config = createDropdown('testSelect', ['low', 'high'], 'low');
      // Change the value after creating the config
      select.value = 'high';
      const value = getDropdownValue(config);
      
      expect(value).toBe('high');
    });
  });

  describe('updateSliderDisplay', () => {
    it('should update associated display element', () => {
      const slider = document.createElement('input');
      slider.id = 'testSlider';
      slider.type = 'range';
      document.body.appendChild(slider);
      
      const display = document.createElement('span');
      display.id = 'testValue';
      document.body.appendChild(display);
      
      const config = createSlider('testSlider', 0, 10, 5);
      // Change the value after creating the config
      slider.value = '3';
      updateSliderDisplay(config, 'testValue');
      
      expect(display.textContent).toBe('3');
    });

    it('should handle missing display element', () => {
      const slider = document.createElement('input');
      slider.id = 'testSlider';
      slider.type = 'range';
      document.body.appendChild(slider);
      
      const config = createSlider('testSlider', 0, 10, 5);
      
      // Should not throw
      expect(() => updateSliderDisplay(config, 'nonExistent')).not.toThrow();
    });
  });
});