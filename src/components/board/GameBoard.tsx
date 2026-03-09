Gameboard:
'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import Tile from './Tile';
import ActionModal from './ActionModal';
import { TILES } from '@/data/tiles';
import { OPPORTUNITA } from '@/data/opportunita';
import { IMPREVISTI } from '@/data/imprevisti';
import { FUNDING_OFFERS } from '@/data/funding';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Skull, Home, ArrowRight, Zap, TrendingUp, Users, DollarSign, BarChart3, PieChart, Activity, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- CONFIGURAZIONE VISIVA DOMINI ---
const CATEGORY_COLORS: Record<string, string> = {
  PRODUCT: '#ef4444',    // Rosso
  FOUNDATION: '#3b82f6', // Blu
  MARKET: '#f59e0b',     // Giallo/Arancio
  EXPANSION: '#8b5cf6',  // Viola
  FINANCE: '#10b981'     // Verde
};

const DominionIcon = ({ grade, color }: { grade: string, color: string }) => {
  const baseClass = "drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-pulse";
  if (grade === 'bronze') return (
    <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] ${baseClass}`}
         style={{ borderBottomColor: color }} />
  );
  if (grade === 'silver') return (
    <div className={`w-2.5 h-2.5 ${baseClass}`} style={{ backgroundColor: color }} />
  );
  return (
    <div className={`w-3 h-3 rounded-full border-2 border-white/50 ${baseClass}`}
         style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
  );
};

const getRocketRotation = (tileId) => {
  if (tileId >= 0 && tileId <= 7) return 90;   // Ore 3 (Destra)
  if (tileId >= 8 && tileId <= 14) return 180; // Ore 6 (Giù)
  if (tileId >= 15 && tileId <= 21) return 270; // Ore 9 (Sinistra)
  return 0;                                    // Ore 12 (Su)
};

const RocketToken = ({ color = "#ff0000", valuation = 0, isMoving = false, rotation = 0 }) => {
  const getTrailLevel = (val) => {
    if (val <= 500000) return 1;
    if (val <= 1000000) return 2;
    if (val <= 2500000) return 3;
    if (val <= 5000000) return 4;
    return 5;
  };
  const level = getTrailLevel(valuation);

  return (
    <motion.div 
      animate={{ rotate: rotation }} 
      transition={{ type: "spring", stiffness: 60 }}
      className="relative w-10 h-10 flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* SCIA DINAMICA (Sotto il razzo) */}
        <motion.g 
          animate={isMoving ? { opacity: [0.4, 1, 0.4], y: [0, 5, 0] } : {}} 
          transition={{ repeat: Infinity, duration: 0.2 }}
        >
          {/* Base Scia */}
          <path 
            d={isMoving ? "M40 70 L50 110 L60 70" : "M45 70 L50 85 L55 70"} 
            fill={`url(#grad-${color})`} 
            opacity={level >= 2 ? 0.7 : 0.4} 
          />
          
          {/* Livelli avanzati: Scie extra durante il movimento */}
          {level >= 3 && (
            <g opacity={isMoving ? 1 : 0.5}>
              <path d="M35 70 L30 100" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
              <path d="M65 70 L70 100" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
            </g>
          )}

          {/* Livello 5: Bagliore di spinta massima */}
          {level >= 5 && isMoving && (
            <circle cx="50" cy="80" r="15" fill={color} opacity="0.2">
              <animate attributeName="r" values="10;20;10" dur="0.3s" repeatCount="indefinite" />
            </circle>
          )}
        </motion.g>

        {/* CORPO RAZZO */}
        <g stroke="black" strokeWidth="3" strokeLinejoin="round">
          <path d="M35 65 L25 78 L35 75 Z" fill={color} /> {/* Pinna SX */}
          <path d="M65 65 L75 78 L65 75 Z" fill={color} /> {/* Pinna DX */}
          <path d="M50 10 C40 10 35 35 35 60 L65 60 C65 35 60 10 50 10 Z" fill="white" />
          <path d="M50 10 C45 10 40 20 40 25 L60 25 C60 20 55 10 50 10 Z" fill={color} />
          <circle cx="50" cy="40" r="4" fill="white" stroke="black" strokeWidth="2" />
        </g>
      </svg>
    </motion.div>
  );
};
export default function GameBoard({ 
  roomCode, 
  localPlayerName, 
  victoryTarget = 20000000 
}: { 
  roomCode: string, 
  localPlayerName: string, 
  victoryTarget?: number 
}) {
  
  const { 
  players, currentPlayer, currentPlayerIndex,
  valuation, 
  movePlayer, upgradeBadge, applyEvent, applyFunding, nextTurn,
  gameWinner, attemptExit, calculateValuation,
  eliminatedPlayerName, setEliminatedPlayerName,
  setPlayers, setCurrentPlayerIndex 
} = useGameLogic([], victoryTarget);
  
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  const lastSyncRef = useRef<string>("");
  const isLocalUpdate = useRef(false);

  if (!roomCode) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-blue-500 font-mono animate-pulse">
      <div className="text-center">
        <Zap size={48} className="mx-auto mb-4" />
        <p className="tracking-[0.2em] uppercase text-sm">Sincronizzazione Startup...</p>
      </div>
    </div>
  );
}

  // --- 1. CARICAMENTO EVENTI DA SUPABASE ---
  useEffect(() => {
    const fetchDbEvents = async () => {
      const { data, error } = await supabase.from('game_events').select('*');
      if (!error && data) setDbEvents(data);
    };
    fetchDbEvents();
  }, []);

  const sanitizeGameState = (state: any) => {
    if (!state || !state.players) return null;
    return {
      ...state,
      currentPlayerIndex: Number(state.currentPlayerIndex),
      players: state.players?.map((p: any) => ({
        ...p,
        position: Number(p.position) || 0,
        cash: Number(p.cash),
        mrr: Number(p.mrr),
        laps: Number(p.laps) || 0,
        equity: Number(p.equity),
        monthlyCosts: Number(p.monthlyCosts) || 0,
        assets: p.assets || [],
        debts: p.debts || []
      }))
    };
  };

  // --- 2. GESTIONE REALTIME ---
  useEffect(() => {
    if (!roomCode) return;

    const fetchAndSubscribe = async () => {
      // 1. Fetch iniziale
      const { data, error } = await supabase
        .from('multiplayer_games')
        .select('game_state')
        .eq('room_code', roomCode)
        .maybeSingle();

      if (error) {
        console.error("Errore caricamento DB:", error);
      } else if (data?.game_state) {
        const initialState = sanitizeGameState(data.game_state);
        if (initialState && initialState.players) {
          setPlayers(initialState.players);
          setCurrentPlayerIndex(initialState.currentPlayerIndex || 0);
          lastSyncRef.current = JSON.stringify(initialState);
        }
      }

      // 2. Sottoscrizione Realtime
      const channel = supabase
        .channel(`room-${roomCode}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'multiplayer_games',
          filter: `room_code=eq.${roomCode}`
        }, (payload) => {
          const newState = sanitizeGameState(payload.new.game_state);
          if (!newState || !newState.players) return;

          const stateStr = JSON.stringify(newState);
          if (stateStr === lastSyncRef.current) return;

          // Aggiornamento atomico dello stato
          setPlayers(newState.players);
          setCurrentPlayerIndex(newState.currentPlayerIndex);
          
          if (newState.lastDiceValue !== undefined) {
            setDiceValue(newState.lastDiceValue);
          }
          
          lastSyncRef.current = stateStr;
        })
        .subscribe();

      return channel;
    };

    const channelPromise = fetchAndSubscribe();

    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [roomCode, localPlayerName]); // Rimosse setPlayers/setCurrentPlayerIndex per stabilità

// --- RESET AUTOMATICO DEL MOVIMENTO ---
  // Questo effetto "osserva" l'indice del giocatore di turno.
  // Appena cambia (per passaggio turno o per rimozione host), 
  // sblocca i dadi per il nuovo giocatore.
  useEffect(() => {
    if (currentPlayerIndex !== undefined) {
      console.log("Cambio turno rilevato, sblocco i dadi per l'indice:", currentPlayerIndex);
      setHasMovedThisTurn(false);
    }
  }, [currentPlayerIndex]); 
  // Usiamo currentPlayerIndex come dipendenza perché è il valore primitivo 
  // che cambia sempre quando il turno ruota.
  // ------------------------------------------------------------

  const syncGameState = useCallback(async (updatedPlayers: any[], nextIndex: number, currentDice?: number) => {
    isLocalUpdate.current = true;
    const newState = { 
      players: updatedPlayers, 
      currentPlayerIndex: nextIndex,
      lastDiceValue: currentDice ?? diceValue,
      victoryTarget: victoryTarget 
    };
    const stateStr = JSON.stringify(newState);
    lastSyncRef.current = stateStr;

    await supabase
      .from('multiplayer_games')
      .update({ game_state: newState })
      .eq('room_code', roomCode);
    
    setTimeout(() => { isLocalUpdate.current = false; }, 1000);
  }, [roomCode, victoryTarget, diceValue]);

  // --- 3. LOGICA FLUSSO TURNO ---
  const handleCloseModal = useCallback(() => {
    setModalConfig({ isOpen: false });
  }, []);

  const handlePassTurn = useCallback(async () => {
    if (!players || players.length === 0) return;

    // 1. Troviamo l'indice del giocatore attuale
    const currentIndex = players.findIndex(p => p.id === currentPlayer.id);
    
    // 2. Calcoliamo il prossimo indice saltando i giocatori rimossi/bancarotti
    let nextIdx = (currentIndex + 1) % players.length;
    let safetyCounter = 0;

    // Finchè il giocatore all'indice nextIdx è in bancarotta, passa al successivo
    while (players[nextIdx].isBankrupt && safetyCounter < players.length) {
      nextIdx = (nextIdx + 1) % players.length;
      safetyCounter++;
    }

    // 3. Reset immediato dello stato locale per evitare glitch grafici
    setHasMovedThisTurn(false);
    setIsRolling(false); // Sicurezza extra: sblocca i dadi se erano rimasti appesi
    
    // 4. Sincronizziamo il Database con l'indice "pulito" (quello del giocatore attivo)
    // Questo è il passaggio chiave: il DB non saprà mai che esisteva il turno del rimosso
    await syncGameState(players, nextIdx);
    
    // 5. Aggiorniamo l'hook locale
    // Assicurati che il tuo nextTurn() nell'hook usi la stessa logica di salto
    nextTurn();

    console.log(`Turno passato da ${currentIndex} a ${nextIdx} (saltando eventuali rimossi)`);
  }, [players, currentPlayer, nextTurn, syncGameState]);

  // --- FUNZIONE AGGIUNTA PER RIMOZIONE/ABBANDONO ---
const handleRemovePlayer = useCallback(async (playerToRemoveId: number) => {
  // 1. Creiamo il nuovo stato dei giocatori: chi viene rimosso va in bancarotta
  const updatedPlayers = players?.map(p => 
    p.id === playerToRemoveId 
      ? { ...p, isBankrupt: true, cash: 0, mrr: 0, assets: [], debts: [] } 
      : p
  );

  // 2. Calcoliamo chi deve giocare ora. 
  // Se il rimosso era il giocatore di turno, passiamo al prossimo.
  let nextIdx = players.findIndex(p => p.id === currentPlayer.id);
  
  if (playerToRemoveId === currentPlayer.id) {
    nextIdx = (nextIdx + 1) % updatedPlayers.length;
    // Saltiamo eventuali altri giocatori già falliti
    while (updatedPlayers[nextIdx].isBankrupt && updatedPlayers.filter(pl => !pl.isBankrupt).length > 0) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
    }
  }

  // 3. Sincronizziamo globalmente
  await syncGameState(updatedPlayers, nextIdx);
  
  // 4. Se ero io ad abbandonare, torno alla home
  if (players.find(p => p.id === playerToRemoveId)?.name === localPlayerName) {
    window.location.href = '/';
  }
}, [players, currentPlayer, syncGameState, localPlayerName]);


// --- LOGICA DOMINI E MOLTIPLICATORI ---
const getPlayerDominions = useCallback((player: any) => {
  if (!player || !player.assets) return [];
  const categories = Array.from(new Set(TILES.filter(t => t.badges).map(t => t.category)));
  
  return categories.map(cat => {
    const tilesInCategory = TILES.filter(t => t.category === cat && t.badges);
    const ownedAssets = player.assets.filter((a: any) => 
      tilesInCategory.some(t => Number(t.id) === Number(a.tileId))
    );

    if (ownedAssets.length !== tilesInCategory.length) return null;

    const levels = ownedAssets.map((a: any) => a.level);
    if (levels.every((l: any) => l === 'gold')) return { cat, grade: 'gold' };
    if (levels.every((l: any) => l === 'silver' || l === 'gold')) return { cat, grade: 'silver' };
    if (levels.every((l: any) => l === 'bronze' || l === 'silver' || l === 'gold')) return { cat, grade: 'bronze' };
    
    return null;
  }).filter(Boolean) as { cat: string, grade: string }[];
}, []);

const getCategoryMultiplier = useCallback((owner: any, category: string) => {
  if (!owner || !owner.assets) return 1;
  const categoryTiles = TILES.filter(t => t.category === category && t.badges);
  if (categoryTiles.length === 0) return 1;

  const ownedInCategory = owner.assets.filter((asset: any) => 
    categoryTiles.some(t => Number(t.id) === Number(asset.tileId))
  );

  if (ownedInCategory.length !== categoryTiles.length) return 1;

  const levels = ownedInCategory.map((a: any) => a.level);
  if (levels.every((l: string) => l === 'gold')) return 5;
  if (levels.every((l: string) => l === 'silver' || l === 'gold')) return 3;
  if (levels.every((l: string) => l === 'bronze' || l === 'silver' || l === 'gold')) return 2;
  
  return 1;
}, []);

// --- FINE LOGICA DOMINI ---


  const handleDiceRoll = () => {
  if (!currentPlayer || currentPlayer?.name !== localPlayerName) return;
  if (modalConfig.isOpen || isRolling || hasMovedThisTurn || isLocalUpdate.current) return;

  setIsRolling(true);
  let counter = 0;
  const shuffleInterval = setInterval(() => {
    setDiceValue(Math.floor(Math.random() * 6) + 1);
    if (++counter >= 12) {
      clearInterval(shuffleInterval);
      const steps = Math.floor(Math.random() * 6) + 1;
      setDiceValue(steps);
      
      setTimeout(() => {
        // 1. Otteniamo i dati aggiornati (MRR già ricalcolato dall'hook)
        const { tile, updatedPlayers } = movePlayer(steps);
        
        setIsRolling(false);
        setHasMovedThisTurn(true);
        
        // 2. Aggiorniamo lo stato locale
        setPlayers(updatedPlayers);
        
        const currentIndex = updatedPlayers.findIndex(p => p.id === currentPlayer.id);
        
        // 3. Sincronizziamo SUBITO con i dati 'updatedPlayers' freschi
        syncGameState(updatedPlayers, currentIndex, steps);
        
        // 4. Passiamo i dati freschi a processTile
        processTile(tile, updatedPlayers);
      }, 600);
    }
  }, 60);
};


  
  const processTile = (tile: any, currentPlayers: any[]) => {
    if (!tile) return;
    const corners = [0, 7, 14, 21];
    if (corners.includes(tile.id)) { handleCornerTile(tile); return; }
    
    if (tile.id === 27) {
      const currentVal = calculateValuation(currentPlayer);
      const founderExitValue = (currentVal * (currentPlayer.equity || 100)) / 100;
      const canExit = founderExitValue >= victoryTarget && currentPlayer.equity > 0;
      setModalConfig({
        isOpen: true, 
        type: canExit ? 'success' : 'danger',
        title: "Tavolo delle Trattative Exit",
        description: canExit 
          ? `Complimenti! La tua quota del ${currentPlayer.equity.toFixed(1)}% vale €${founderExitValue.toLocaleString()}, superando il tuo obiettivo personale di €${victoryTarget.toLocaleString()}.` 
          : `Non puoi ancora vendere. La tua quota vale €${founderExitValue.toLocaleString()}, ma il tuo obiettivo è €${victoryTarget.toLocaleString()}.`,
        impact: { details: `Valutazione Aziendale: €${currentVal.toLocaleString()} | Tua Quota: €${founderExitValue.toLocaleString()}` },
        actionLabel: canExit ? "Vendi e Vinci" : "Rifiuta e continua",
        onAction: () => { if(canExit) attemptExit(); handleCloseModal(); },
        onClose: handleCloseModal
      });
      return;
    }

  if (tile.type === 'special') {
      // 1. Identifica il tipo di casella (Probabilità/Opportunità vs Imprevisti/Risk)
      const isOpp = tile.name?.toLowerCase().includes("probabilità") || [3, 15, 22].includes(tile.id);
      
      // 2. Filtra gli eventi caricati dal Database (dbEvents deve essere lo stato che contiene i dati di Supabase)
      const deck = dbEvents.filter(e => e.type === (isOpp ? 'OPPORTUNITY' : 'RISK'));
      
      // 3. Controllo di sicurezza: se il DB non ha risposto, usciamo per evitare crash
      if (deck.length === 0) {
        console.warn("Mazzo eventi vuoto sul DB! Controlla la connessione a Supabase.");
        return;
      }

      // 4. Estrazione casuale dell'evento dal mazzo filtrato
      const event = deck[Math.floor(Math.random() * deck.length)];

      // 5. Preparazione della stringa dei dettagli per l'interfaccia (il modale)
      const impactDetails = [];
      if (Number(event.cash_effect) !== 0) {
        impactDetails.push(`${event.cash_effect > 0 ? '+' : ''}€${Number(event.cash_effect).toLocaleString()} Cash`);
      }
      if (Number(event.revenue_modifier) !== 0) {
        impactDetails.push(`${event.revenue_modifier > 0 ? '+' : ''}€${Number(event.revenue_modifier).toLocaleString()} MRR`);
      }
      if (Number(event.cost_modifier) !== 0) {
        impactDetails.push(`${event.cost_modifier > 0 ? '+' : ''}€${Number(event.cost_modifier).toLocaleString()} Costi`);
      }

      // 6. Apertura del Modale con i dati del DB
      setModalConfig({ 
        isOpen: true, 
        type: isOpp ? 'opportunity' : 'danger_event', 
        title: event.title, 
        description: event.description, // Usiamo la colonna 'description' del DB
        insight: event.insight,
        impact: { details: impactDetails.join(' | ') || "Variazione operativa" },
        actionLabel: "Ricevuto", 
        onAction: () => { 
    applyEvent({
        ...event, // Passa tutto l'oggetto del DB
        // TRADUZIONE OBBLIGATORIA:
        cashEffect: Number(event.cash_effect) || 0,
        revenueModifier: Number(event.revenue_modifier) || 0,
        costModifier: Number(event.cost_modifier) || 0
    }); 
    handleCloseModal(); 
}
      });
      return;
    }

    if (tile.type === 'asset') {
      const owner = currentPlayers.find(p => p && !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => Number(a.tileId) === Number(tile.id)));
      const myAsset = currentPlayer.assets.find(a => a.tileId === tile.id);
      const currentLevel = myAsset ? myAsset.level : 'none';
      const revMod = tile.revenueModifier || 0;
      const costMod = tile.costModifier || 0;
      const immediateImpact = `Impatto Casella: MRR ${revMod >= 0 ? '+' : ''}${revMod.toLocaleString()} | Costi ${costMod >= 0 ? '+' : ''}${costMod.toLocaleString()}`;

      if (owner) {
        const asset = owner.assets.find(a => a.tileId === tile.id);
        const level = asset?.level || 'none';
        const multiplier = getCategoryMultiplier(owner, tile.category);
        const baseToll = Number(tile.badges?.[level]?.toll) || 0;
        const finalToll = baseToll * multiplier;

        setModalConfig({ 
          isOpen: true, 
          type: 'danger', 
          title: multiplier > 1 ? "⚠️ Dominio di Mercato" : "Tassa di Mercato", 
          description: multiplier > 1 
            ? `${owner.name} ha il monopolio nel settore ${tile.category}!` 
            : `Sei atterrato su un asset di ${owner.name}.`,
          insight: tile.insight,
          impact: { 
            details: `${immediateImpact} | Royalty: -€${finalToll.toLocaleString()} ${multiplier > 1 ? `(Settore Completo x${multiplier}!)` : ''}` 
          }, 
          actionLabel: "Paga Royalty", 
          onAction: async () => {
            try {
              const currentIndex = currentPlayers.findIndex(p => p.id === currentPlayer.id);
              await syncGameState(currentPlayers, currentIndex);
              handleCloseModal();
            } catch (err) {
              console.error("Errore durante il sync della royalty:", err);
              handleCloseModal();
            }
          }
        }); 
      }
      else {
        const badgesInfo = {
          currentLevel: currentLevel,
          bronze: { ...tile.badges.bronze, owned: ['bronze', 'silver', 'gold'].includes(currentLevel) },
          silver: { ...tile.badges.silver, owned: ['silver', 'gold'].includes(currentLevel) },
          gold: { ...tile.badges.gold, owned: currentLevel === 'gold' }
        };
        const levelsData = [{ id: 'bronze', label: 'Bronzo' }, { id: 'silver', label: 'Argento' }, { id: 'gold', label: 'Oro' }];
        const nextLevelIndex = currentLevel === 'none' ? 0 : currentLevel === 'bronze' ? 1 : currentLevel === 'silver' ? 2 : 3;
        const nextLevelLabel = levelsData[nextLevelIndex]?.label || '';
        const nextLevelToll = nextLevelIndex < 3 ? tile.badges[levelsData[nextLevelIndex].id].toll : 0;

        setModalConfig({
          isOpen: true, type: 'success', title: tile.name,
          description: tile.badgeCta || "Sblocca i Badge per riscuotere royalty dai competitor.",
          insight: tile.insight, badges: badgesInfo,
          impact: { details: `${immediateImpact} | ${nextLevelIndex < 3 ? `Royalty futura: €${nextLevelToll.toLocaleString()}` : "Livello Massimo"}` },
          actionLabel: nextLevelIndex > 2 ? "Massimo Livello" : `Acquista ${nextLevelLabel}`,
          secondaryActionLabel: nextLevelIndex <= 2 ? "Rifiuta" : null,
          onAction: () => { upgradeBadge(tile.id); handleCloseModal(); },
          onClose: handleCloseModal
        });
      }
      return;
    }

    if (tile.type === 'tax') {
      const revMod = tile.revenueModifier || 0;
      const costMod = tile.costModifier || 0;
      const immediateImpact = `MRR: ${revMod >= 0 ? '+' : ''}${revMod.toLocaleString()} | Costi: ${costMod >= 0 ? '+' : ''}${costMod.toLocaleString()}`;
      const owner = currentPlayers.find(p => p && !p.isBankrupt && p.id !== currentPlayer.id && p.assets.some(a => a.tileId === tile.id));

      if (owner && tile.badges) {
        const asset = owner.assets.find(a => a.tileId === tile.id);
        const level = asset?.level || 'none';
        const multiplier = getCategoryMultiplier(owner, tile.category);
        const finalToll = (Number(tile.badges[level]?.toll) || 0) * multiplier;

        setModalConfig({
          isOpen: true,
          type: 'danger',
          title: "Costo di Settore",
          description: `Questa infrastruttura è gestita da ${owner.name}.`,
          insight: tile.insight,
          impact: { details: `${immediateImpact} | Royalty: -€${finalToll.toLocaleString()}` },
          actionLabel: "Paga",
          onAction: async () => {
            try {
              const currentIndex = currentPlayers.findIndex(p => p.id === currentPlayer.id);
              await syncGameState(currentPlayers, currentIndex);
              handleCloseModal();
            } catch (err) {
              console.error("Errore durante il sync della royalty:", err);
              handleCloseModal();
            }
          }
        });
      }
      else if (tile.badges) {
        const myAsset = currentPlayer.assets.find(a => a.tileId === tile.id);
        const currentLevel = myAsset ? myAsset.level : 'none';
        const badgesInfo = {
          currentLevel: currentLevel,
          bronze: { ...tile.badges.bronze, owned: ['bronze', 'silver', 'gold'].includes(currentLevel) },
          silver: { ...tile.badges.silver, owned: ['silver', 'gold'].includes(currentLevel) },
          gold: { ...tile.badges.gold, owned: currentLevel === 'gold' }
        };

        setModalConfig({
          isOpen: true,
          type: 'danger',
          title: tile.name,
          description: tile.badgeCta || "Variazione dei flussi operativi.",
          insight: tile.insight,
          badges: badgesInfo,
          impact: { details: immediateImpact },
          actionLabel: currentLevel === 'gold' ? "Massimo Livello" : "Sblocca Efficienza",
          secondaryActionLabel: "Ignora",
          onAction: () => { upgradeBadge(tile.id); handleCloseModal(); },
          onClose: handleCloseModal
        });
      } else {
        setModalConfig({
          isOpen: true, 
          type: 'danger', 
          title: tile.name, 
          description: "Variazione automatica dei flussi operativi.",
          insight: tile.insight,
          impact: { details: immediateImpact },
          actionLabel: "Ricevuto", 
          onAction: handleCloseModal 
        });
      }
      return;
    }
   };
 const handleCornerTile = (tile: any) => {
    if (!currentPlayer) return;
    switch (tile.id) {
        case 0:
            const totalDebtAmount = (currentPlayer.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
            if (totalDebtAmount > 0) {
                const totalCapital = (currentPlayer.debts || []).reduce((acc, d) => acc + Number(d.capitalInstallment), 0);
                setModalConfig({
                    isOpen: true, type: 'info', title: "Chiusura Anno Fiscale",
                    description: `Rendicontazione annuale completata. Pagata quota capitale: €${totalCapital.toLocaleString()}`,
                    impact: { details: `Rata: -€${totalCapital.toLocaleString()} (Cash)` },
                    actionLabel: "Continua", onAction: handleCloseModal
                });
            } else {
                setModalConfig({
                    isOpen: true, type: 'info', title: "Revisione dei Bilanci",
                    description: "L'anno fiscale si chiude in assenza di debiti finanziari.",
                    impact: { details: "Audit superato con successo" },
                    actionLabel: "Continua", onAction: handleCloseModal
                });
            }
            break;
        default:
            const currentVal = calculateValuation(currentPlayer);
            const offer = { ...FUNDING_OFFERS[Math.floor(Math.random() * FUNDING_OFFERS.length)] };
            let details = "";

            if (offer.type === 'EQUITY') {
                const cashAmount = (currentVal * 15) / 100;
                details = `Iniezione Cash: €${cashAmount.toLocaleString()} | Cessione: 15% Equity`;
            }
            else if (offer.type === 'BANK') {
                const amount = Number(offer.fixedAmount) || 0;
                const rate = (Number(offer.interestRate) * 100).toFixed(1);
                const duration = offer.durationYears || 3;
                const installment = amount / duration;
                details = `Prestito: €${amount.toLocaleString()} | Tasso: ${rate}% | Rata: €${installment.toLocaleString()} | Durata: ${duration} giri`;
            }
            else if (offer.type === 'GRANT') {
                details = `Capitale a fondo perduto: +€${(Number(offer.fixedAmount) || 25000).toLocaleString()}`;
            }

            setModalConfig({
                isOpen: true,
                type: 'info',
                title: `Round: ${offer.investor}`,
                description: offer.description,
                impact: { details },
                actionLabel: "Accetta",
                secondaryActionLabel: "Rifiuta",
                onAction: () => {
                    applyFunding(offer);
                    handleCloseModal();
                },
                onClose: handleCloseModal
            });
            break;
    }
};

const activePlayer = (players && players.length > 0 && currentPlayerIndex !== undefined && players[currentPlayerIndex])
    ? players[currentPlayerIndex]
    : { name: localPlayerName, cash: 0, mrr: 0, position: 0, assets: [], debts: [], equity: 100 };

// --- CARICAMENTO ---
if (!players || players.length === 0) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 flex-col gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase animate-pulse">
                Sincronizzazione Startup...
            </p>
        </div>
    );
}

return (
    <div className="flex flex-row gap-6 p-4 w-full min-h-screen items-start bg-transparent font-sans text-white relative overflow-x-hidden">
        {/* --- VITTORIA MODAL --- */}
        <AnimatePresence>
            {gameWinner && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-6xl bg-slate-900 border border-blue-500/30 rounded-[3rem] p-6 md:p-10 shadow-2xl text-center relative">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-1">Vittoria Epica!</h2>
                        <div className="space-y-3 mb-10 mt-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {[...players].sort((a, b) => {
                                const valA = (calculateValuation(a) * (a.equity || 100)) / 100;
                                const valB = (calculateValuation(b) * (b.equity || 100)) / 100;
                                return valB - valA;
                            }).map((p, idx) => {
                                const totalVal = calculateValuation(p);
                                const founderIncasso = (totalVal * (p.equity || 100)) / 100;
                                return (
                                    <motion.div key={p.id} className={`flex flex-col lg:flex-row items-center gap-4 p-5 rounded-[2rem] border ${p.id === gameWinner.id ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-white/5 border-white/10 opacity-70'}`}>
                                        <div className="flex items-center gap-4 min-w-[200px] w-full lg:w-1/4">
                                            <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-black text-white bg-slate-800 border border-white/10">{idx + 1}</div>
                                            <div className="text-left overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 flex-shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                                                    <span className="font-black text-white uppercase text-base truncate">{p.name}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block truncate">Quota: {p.equity?.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full lg:flex-1">
                                            <div className="text-center lg:text-right px-3 border-r border-white/5 overflow-hidden">
                                                <span className="block text-[8px] text-slate-500 uppercase font-black mb-1">Cash</span>
                                                <span className="text-white font-mono font-bold text-sm block truncate">€{Math.floor(Number(p.cash)).toLocaleString()}</span>
                                            </div>
                                            <div className="text-center lg:text-right px-3 overflow-hidden">
                                                <span className="block text-[8px] text-blue-400 uppercase font-black italic mb-1">Net Founder Exit</span>
                                                <span className="text-blue-400 font-mono font-black text-lg block truncate">€{Math.floor(founderIncasso).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-white text-slate-900 font-black uppercase rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-xl text-sm">Nuova Scalata</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- TABELLONE --- */}
        <div className="relative flex-shrink-0 w-[800px] aspect-square bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute inset-[26%] flex flex-col items-center justify-center bg-slate-800/40 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] z-20 p-6 text-center shadow-inner">
                <div className="absolute top-4 text-[7px] text-slate-600 font-mono uppercase tracking-[0.3em]">Room: {roomCode}</div>
                <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activePlayer?.color || '#3b82f6' }} />
                    <span className="text-white font-black text-[9px] uppercase tracking-widest font-mono">
                        {!activePlayer
                            ? "CARICAMENTO..."
                            : (activePlayer.name === localPlayerName ? "È IL TUO TURNO" : `TURNO DI ${activePlayer.name}`)
                        }
                    </span>
                </div>
                <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl border-2 transition-all ${isRolling ? 'scale-110 border-blue-500 rotate-12' : 'border-white/10'} bg-slate-800 text-white text-3xl font-black font-mono`}>
                    {diceValue || '?'}
                </div>
                <div className="text-2xl font-black text-white italic mb-1 tracking-tighter font-mono">€{(Number(valuation) || 0).toLocaleString()}</div>
                <span className="text-blue-400 font-mono text-[7px] uppercase tracking-widest opacity-60 mb-6 block">Company Valuation</span>

                <div className="flex flex-col gap-3 w-full items-center">
                    {!hasMovedThisTurn ? (
                        <button
                            onClick={handleDiceRoll}
                            disabled={isRolling || isLocalUpdate.current || modalConfig.isOpen || currentPlayer?.isBankrupt || currentPlayer?.name !== localPlayerName}
                            className={`px-10 py-3 font-black rounded-xl text-white text-[10px] font-mono transition-all
                  ${currentPlayer?.name === localPlayerName ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
                        >
                            {currentPlayer?.isBankrupt ? "OUT" : (isRolling ? "Lancio..." : (currentPlayer?.name === localPlayerName ? "Lancia Dadi" : "Attendi..."))}
                        </button>
                    ) : (
                        !modalConfig.isOpen && currentPlayer?.name === localPlayerName && (
                            <button
                                onClick={handlePassTurn}
                                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 font-black rounded-xl text-white text-[10px] font-mono flex items-center gap-2 shadow-lg animate-bounce"
                            >
                                PASSA TURNO <ArrowRight size={14} />
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full font-mono">
                {TILES.map((tile) => {
                    let row, col;
                    if (tile.id <= 7) { row = 1; col = tile.id + 1; }
                    else if (tile.id <= 14) { col = 8; row = tile.id - 6; }
                    else if (tile.id <= 21) { row = 8; col = 8 - (tile.id - 14); }
                    else { col = 1; row = 8 - (tile.id - 21); }
                    const playersHere = players.filter(p => p && Number(p.position) === tile.id && !p.isBankrupt);
                    const tileOwner = players.find(p => p && p.assets.some(a => a.tileId === tile.id));
                    return (
                        <div key={tile.id} style={{ gridRow: row, gridColumn: col }} className="relative h-full w-full">
                            <Tile
                                {...tile}
                                isActive={playersHere.length > 0}
                                ownerBadge={tileOwner?.assets.find(a => a.tileId === tile.id)?.level || 'none'}
                                ownerColor={tileOwner?.color || 'transparent'}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                <div className="flex -space-x-4 items-center justify-center">
                                    {playersHere.map(p => (
                                        <motion.div
                                            key={p.id}
                                            layoutId={`player-rocket-${p.id}`}
                                            transition={{
                                                type: "spring",
                                                stiffness: 70,
                                                damping: 15,
                                                mass: 1
                                            }}
                                            className="relative"
                                        >
                                            <RocketToken
                                                color={p.color}
                                                valuation={calculateValuation(p)}
                                                isMoving={isRolling && p.id === currentPlayer?.id}
                                                rotation={getRocketRotation(p.position)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- DASHBOARD LATERALE --- */}
        <div className="flex-1 space-y-3 font-mono h-[calc(100vh-40px)] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-4 px-2 italic">Dashboard {localPlayerName}</h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-max">
                {players?.filter(p => p !== null).map((p) => {
                    const isTurn = p.id === currentPlayer?.id;
                    const isMe = p.name === localPlayerName;
                    const currentEbitda = (Number(p.mrr) || 0) - (Number(p.monthlyCosts) || 0);
                    const pVal = calculateValuation(p) || 0;
                    const founderPart = (pVal * (Number(p.equity) || 100)) / 100;
                    const totalDebt = (p.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
                    return (
                        <div key={p.id} className={`p-4 rounded-2xl border transition-all duration-500 ${isTurn ? 'bg-blue-600/20 border-blue-500 shadow-lg' : 'bg-slate-900/50 border-white/5 opacity-80'} ${isMe ? 'ring-1 ring-white/20' : ''} ${p.isBankrupt ? 'grayscale opacity-50' : ''}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center scale-[0.99] origin-center">
                                        <RocketToken color={p.color} valuation={calculateValuation(p)} />
                                    </div>
                                    <span className={`font-bold text-xs uppercase tracking-tight ${p.isBankrupt ? 'line-through text-rose-500' : 'text-white'}`}>
                                        {p.name} {isMe && "(TU)"}
                                    </span>
                                </div>
                                {!p.isBankrupt && <span className="text-[10px] font-black text-blue-400">{Number(p.equity || 0).toFixed(1)}% EQ</span>}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                                <div className="bg-black/30 p-2 rounded-lg text-center">
                                    <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Cash</span>
                                    <span className={`font-black ${p.cash < 0 ? 'text-rose-400' : 'text-white'}`}>€{Math.floor(p.cash).toLocaleString()}</span>
                                </div>
                                <div className="bg-black/30 p-2 rounded-lg text-center">
                                    <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">EBITDA</span>
                                    <span className={`font-black ${currentEbitda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>€{currentEbitda.toLocaleString()}</span>
                                </div>
                                <div className="bg-black/30 p-2 rounded-lg text-center">
                                    <span className="text-slate-500 block text-[6px] uppercase font-black mb-1">Debiti</span>
                                    <span className="text-rose-400 font-black">€{totalDebt.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 uppercase font-black text-[7px]">Company Val.</span>
                                    <span className="text-white font-black text-[10px]">€{pVal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-400 uppercase font-black text-[7px]">Founder Exit Val.</span>
                                    <span className="text-blue-400 font-black text-xs italic">€{founderPart.toLocaleString()}</span>
                                </div>
                                <div className="mt-3 flex flex-col gap-2">
                                    {isMe && !p.isBankrupt && (
                                        <button
                                            onClick={() => {
                                                if (confirm("Sei sicuro di voler abbandonare la partita? La tua startup fallirà.")) {
                                                    handleRemovePlayer(p.id);
                                                }
                                            }}
                                            className="w-full py-2 bg-orange-600/20 hover:bg-orange-600 border border-orange-500/50 text-orange-500 hover:text-white rounded-xl text-[8px] font-black uppercase transition-all shadow-sm"
                                        >
                                            Abbandona Partita
                                        </button>
                                    )}

                                    {players[0]?.name === localPlayerName && !isMe && !p.isBankrupt && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Rimuovere ${p.name} per inattività?`)) {
                                                    handleRemovePlayer(p.id);
                                                }
                                            }}
                                            className="w-full py-2 mt-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/30 text-rose-500 hover:text-white rounded-xl text-[8px] font-black uppercase transition-all shadow-sm animate-pulse hover:animate-none"
                                        >
                                            Rimuovi Inattivo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <ActionModal {...modalConfig} currentPlayerCash={currentPlayer?.cash || 0} />

        {/* --- BANCAROTTA --- */}
        <AnimatePresence>
            {eliminatedPlayerName && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-red-950 border-2 border-red-500 p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Skull size={32} className="text-white" /></div>
                        <div className="text-red-500 text-5xl mb-2 font-black italic uppercase">Default</div>
                        <h2 className="text-xl text-white font-bold mb-3 uppercase tracking-widest">{eliminatedPlayerName} eliminato</h2>
                        <button onClick={() => setEliminatedPlayerName(null)} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all text-[10px]">Continua Partita</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="fixed bottom-6 right-6 z-[100]">
            <button onClick={() => window.location.href = '/'} className="group flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-blue-500/50 p-2 pr-5 rounded-full transition-all">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors"><Home size={18} className="text-white" /></div>
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Exit to Home</span>
                    <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Abbandona Scalata</span>
                </div>
            </button>
        </div>
    </div>
);
}; // <--- QUESTA È LA PARENTESI CHE MANCAVA!
