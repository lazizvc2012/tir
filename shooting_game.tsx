import React, { useState, useEffect } from 'react';
import { Target, ShoppingCart, Award } from 'lucide-react';

const WEAPONS = [
  { id: 1, name: 'Пистолет', damage: 10, price: 0, owned: true },
  { id: 2, name: 'Револьвер', damage: 15, price: 100, owned: false },
  { id: 3, name: 'Дробовик', damage: 25, price: 250, owned: false },
  { id: 4, name: 'Винтовка', damage: 35, price: 500, owned: false },
  { id: 5, name: 'Снайперка', damage: 50, price: 1000, owned: false }
];

const BOOSTERS = [
  { id: 1, name: 'x2 Кристаллы', price: 150, duration: 30 },
  { id: 2, name: 'Замедление', price: 200, duration: 20 }
];

const DIFFICULTIES = [
  { name: 'Легкий', lines: 1, speed: 3 },
  { name: 'Нормальный', lines: 3, speed: 4 },
  { name: 'Сложный', lines: 6, speed: 5 },
  { name: 'Эксперт', lines: 9, speed: 6 }
];

export default function ShootingRange() {
  const [scene, setScene] = useState('menu');
  const [crystals, setCrystals] = useState(0);
  const [weapons, setWeapons] = useState(WEAPONS);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [targets, setTargets] = useState([]);
  const [activeBoosters, setActiveBoosters] = useState([]);

  useEffect(() => {
    if (scene !== 'game') return;

    const spawnForAllLines = () => {
      const lines = difficulty.lines;
      for (let i = 0; i < lines; i++) {
        const newTarget = {
          id: Date.now() + i * 10,
          line: i,
          position: 0,
          health: 100
        };
        setTargets(prev => [...prev, newTarget]);
      }
    };

    spawnForAllLines();
    const interval = setInterval(spawnForAllLines, 1500);

    return () => clearInterval(interval);
  }, [scene, difficulty]);

  useEffect(() => {
    if (scene !== 'game') return;

    const speed = activeBoosters.some(b => b.name === 'Замедление') ? 
      difficulty.speed * 0.5 : difficulty.speed;

    const moveInterval = setInterval(() => {
      setTargets(prev => {
        const updated = prev.map(t => ({
          ...t,
          position: t.position + speed
        })).filter(t => t.position < 100);
        return updated;
      });
    }, 100);

    return () => clearInterval(moveInterval);
  }, [scene, difficulty, activeBoosters]);

  const shootTarget = (targetId) => {
    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        const newHealth = t.health - selectedWeapon.damage;
        if (newHealth <= 0) {
          const multiplier = activeBoosters.some(b => b.name === 'x2 Кристаллы') ? 2 : 1;
          setCrystals(c => c + 10 * multiplier);
          return null;
        }
        return { ...t, health: newHealth };
      }
      return t;
    }).filter(Boolean));
  };

  const buyWeapon = (weapon) => {
    if (crystals >= weapon.price && !weapon.owned) {
      setCrystals(c => c - weapon.price);
      setWeapons(prev => prev.map(w => 
        w.id === weapon.id ? { ...w, owned: true } : w
      ));
    }
  };

  const buyBooster = (booster) => {
    if (crystals >= booster.price) {
      setCrystals(c => c - booster.price);
      const newBooster = { ...booster, endTime: Date.now() + booster.duration * 1000 };
      setActiveBoosters(prev => [...prev, newBooster]);
      setTimeout(() => {
        setActiveBoosters(prev => prev.filter(b => b.endTime !== newBooster.endTime));
      }, booster.duration * 1000);
    }
  };

  if (scene === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-green-900 flex flex-col items-center justify-center p-8">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-2xl">
          <h1 className="text-6xl font-bold text-yellow-400 mb-8 text-center">🎯 ТИР</h1>
          
          <div className="flex items-center justify-center mb-6 text-3xl text-white">
            <Award className="mr-2" /> {crystals} кристаллов
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setScene('game')}
              className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded transition"
            >
              ИГРАТЬ
            </button>
            <button
              onClick={() => setScene('difficulty')}
              className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold rounded transition"
            >
              СЛОЖНОСТЬ
            </button>
            <button
              onClick={() => setScene('shop')}
              className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded transition"
            >
              <ShoppingCart className="inline mr-2" /> МАГАЗИН
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (scene === 'difficulty') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-green-900 flex items-center justify-center p-8">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-2xl">
          <h2 className="text-4xl font-bold text-yellow-400 mb-6">Выбор сложности</h2>
          <div className="space-y-3">
            {DIFFICULTIES.map(d => (
              <button
                key={d.name}
                onClick={() => { setDifficulty(d); setScene('menu'); }}
                className={`w-full px-6 py-3 text-white text-xl font-bold rounded transition ${
                  difficulty.name === d.name ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {d.name} - {d.lines} {d.lines === 1 ? 'линия' : 'линий'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setScene('menu')}
            className="w-full mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (scene === 'shop') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-green-900 flex items-center justify-center p-8">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-yellow-400">Магазин</h2>
            <div className="text-2xl text-white"><Award className="inline" /> {crystals}</div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Оружие</h3>
            <div className="grid grid-cols-1 gap-3">
              {weapons.map(w => (
                <div key={w.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="text-xl font-bold text-white">{w.name}</div>
                    <div className="text-yellow-400">Урон: {w.damage}</div>
                  </div>
                  {w.owned ? (
                    <button
                      onClick={() => { setSelectedWeapon(w); setScene('menu'); }}
                      className={`px-6 py-2 rounded font-bold ${
                        selectedWeapon.id === w.id ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                    >
                      {selectedWeapon.id === w.id ? 'Выбрано' : 'Выбрать'}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyWeapon(w)}
                      disabled={crystals < w.price}
                      className={`px-6 py-2 rounded font-bold ${
                        crystals >= w.price ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-400'
                      }`}
                    >
                      {w.price} 💎
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Бустеры</h3>
            <div className="grid grid-cols-1 gap-3">
              {BOOSTERS.map(b => (
                <div key={b.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="text-xl font-bold text-white">{b.name}</div>
                    <div className="text-gray-400">{b.duration} сек</div>
                  </div>
                  <button
                    onClick={() => buyBooster(b)}
                    disabled={crystals < b.price}
                    className={`px-6 py-2 rounded font-bold ${
                      crystals >= b.price ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400'
                    }`}
                  >
                    {b.price} 💎
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setScene('menu')}
            className="w-full mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #0a1f3d 0%, #1a4d2e 50%, #2d5016 100%)',
      backgroundImage: `
        radial-gradient(ellipse at 30% 20%, rgba(0, 255, 150, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 30%, rgba(100, 255, 200, 0.4) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 10%, rgba(50, 200, 255, 0.2) 0%, transparent 70%)
      `
    }}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-green-900 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent opacity-50"></div>
      </div>

      <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-6 py-3 rounded-lg">
        <div className="text-2xl font-bold text-yellow-400 flex items-center">
          <Award className="mr-2" /> {crystals}
        </div>
        <div className="text-white">{selectedWeapon.name}</div>
        {activeBoosters.map((b, i) => (
          <div key={i} className="text-sm text-purple-300">{b.name}</div>
        ))}
      </div>

      <button
        onClick={() => { setScene('menu'); setTargets([]); }}
        className="absolute top-4 right-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
      >
        Выйти
      </button>

      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
        {Array.from({ length: difficulty.lines }).map((_, i) => (
          <div key={i} className="relative w-16 h-16 bg-gray-700 rounded border-4 border-gray-800"></div>
        ))}
      </div>

      {targets.map(t => {
        const lineHeight = 80;
        const topOffset = 50;
        const yPos = topOffset + (t.line * lineHeight);
        
        return (
          <div
            key={t.id}
            onClick={() => shootTarget(t.id)}
            className="absolute cursor-crosshair"
            style={{
              right: `${100 - t.position}%`,
              top: `${yPos}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="relative">
              <svg width="80" height="120" viewBox="0 0 100 150">
                <path d="M30 10 L70 10 L75 20 L75 45 L70 50 L30 50 L25 45 L25 20 Z" fill="#1a1a1a" stroke="#666" strokeWidth="1"/>
                <polygon points="40,15 60,15 55,25 45,25" fill="#ff0000"/>
                <line x1="50" y1="0" x2="50" y2="30" stroke="#888" strokeWidth="1"/>
                <line x1="35" y1="22" x2="65" y2="22" stroke="#888" strokeWidth="1"/>
                
                <ellipse cx="50" cy="85" rx="30" ry="25" fill="#1a1a1a" stroke="#666" strokeWidth="1"/>
                <ellipse cx="50" cy="85" rx="22" ry="18" fill="#ff0000"/>
                <ellipse cx="50" cy="85" rx="14" ry="12" fill="#1a1a1a"/>
                <ellipse cx="50" cy="85" rx="6" ry="5" fill="#000"/>
                
                <path d="M20 50 L20 110 L30 120 L70 120 L80 110 L80 50" fill="#1a1a1a" stroke="#666" strokeWidth="1"/>
                
                <line x1="50" y1="50" x2="50" y2="130" stroke="#888" strokeWidth="1"/>
                <line x1="20" y1="85" x2="80" y2="85" stroke="#888" strokeWidth="1"/>
                
                <text x="18" y="90" fill="#ccc" fontSize="10">6</text>
                <text x="28" y="90" fill="#ccc" fontSize="10">7</text>
                <text x="38" y="90" fill="#ccc" fontSize="10">8</text>
                <text x="48" y="90" fill="#ccc" fontSize="10">9</text>
                <text x="60" y="90" fill="#ccc" fontSize="10">9</text>
                <text x="70" y="90" fill="#ccc" fontSize="10">8</text>
                <text x="80" y="90" fill="#ccc" fontSize="10">7</text>
                <text x="88" y="90" fill="#ccc" fontSize="10">6</text>
              </svg>
              <div className="absolute top-0 left-0 w-full bg-red-600 h-2 transition-all rounded"
                style={{ width: `${t.health}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}