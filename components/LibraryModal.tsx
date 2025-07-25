
import React from 'react';
import type { CompletedQuest } from '../types';
import { QuestType } from '../types';
import { XIcon, CameraIcon, PuzzleIcon } from './icons';

interface LibraryModalProps {
  completedQuests: CompletedQuest[];
  onClose: () => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ completedQuests, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-cinzel text-amber-300">Quest Library</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          {completedQuests.length === 0 ? (
            <p className="text-center text-gray-400">Your library is empty. Complete quests to fill it with your achievements!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedQuests.map((cq, index) => (
                <div key={index} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 group">
                  {cq.quest.type === QuestType.PHOTO && cq.userPhoto ? (
                    <img src={cq.userPhoto} alt={cq.quest.title} className="w-full h-48 object-cover"/>
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                       {cq.quest.type === QuestType.PUZZLE ? <PuzzleIcon className="w-16 h-16 text-cyan-500 opacity-30"/> : <CameraIcon className="w-16 h-16 text-purple-500 opacity-30"/>}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-amber-400 truncate">{cq.quest.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{cq.quest.targetLocationName}</p>
                    {cq.quest.type === QuestType.PUZZLE && (
                        <div className="text-sm bg-gray-800 p-2 rounded-md">
                            <p className="text-gray-500 italic">"{cq.quest.puzzle?.prompt}"</p>
                            <p className="mt-1 text-green-400 font-semibold">Solved: {cq.userAnswer}</p>
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;
