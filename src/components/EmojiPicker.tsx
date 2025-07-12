import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const handleEmojiSelect = (emoji: any) => {
    onSelect(emoji.native);
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          theme="light"
          perLine={8}
          maxFrequentRows={2}
          previewPosition="none"
          skinTonePosition="none"
        />
      </div>
    </div>
  );
};