import React from 'react';
import { TEMPLATES, COLOR_PALETTES } from '../constants';
import type { TemplateId, ColorPalette } from '../types';

interface ControlsProps {
  selectedTemplate: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  selectedColor: ColorPalette;
  onColorChange: (palette: ColorPalette) => void;
  showWatermark: boolean;
  onWatermarkToggle: (show: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedTemplate,
  onTemplateChange,
  selectedColor,
  onColorChange,
  showWatermark,
  onWatermarkToggle,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-slate-200 flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-slate-800">Mẫu</h3>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTemplate === template.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3 text-slate-800">Bảng màu</h3>
        <div className="flex flex-wrap gap-3">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.name}
              onClick={() => onColorChange(palette)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                selectedColor.name === palette.name ? 'ring-2 ring-offset-2 ring-offset-white ring-blue-500 border-white' : 'border-transparent'
              } ${palette.bg}`}
              title={palette.name}
            >
              <div className={`w-4 h-4 rounded-full ${palette.primary.replace('text-', 'bg-')}`}></div>
            </button>
          ))}
        </div>
      </div>
       <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800">Watermark</h3>
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                <label htmlFor="watermark-toggle" className="text-sm font-medium text-slate-700 select-none">
                    Hiển thị "TrolyLexa"
                </label>
                <button
                    id="watermark-toggle"
                    type="button"
                    onClick={() => onWatermarkToggle(!showWatermark)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        showWatermark ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={showWatermark}
                >
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showWatermark ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
        </div>
    </div>
  );
};