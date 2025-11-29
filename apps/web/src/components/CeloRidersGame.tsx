"use client";

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { parseEther } from 'viem';
import { readContract } from 'wagmi/actions';
import { useMiniPay } from '@/hooks/useMiniPay';
import { StakeModal } from './StakeModal';
import { ScoreSubmitModal } from './ScoreSubmitModal';
import { NotificationModal } from './NotificationModal';

// Import game scenes
import Preload from '../game/scenes/Preload';
import Splash1 from '../game/scenes/Splash1';
import Splash2 from '../game/scenes/Splash2';
import Splash3 from '../game/scenes/Splash3';
import Splash4 from '../game/scenes/Splash4';
import Splash5 from '../game/scenes/Splash5';
import MainMenu from '../game/scenes/MainMenu';
import CharacterSelect from '../game/scenes/CharacterSelect';
import Game from '../game/scenes/Game';
import GameOver from '../game/scenes/GameOver';
import OptionsMenu from '../game/scenes/OptionsMenu';
import HowToPlay from '../game/scenes/HowToPlay';
import Leaderboard from '../game/scenes/Leaderboard';

// cUSD token address on Celo Sepolia
const CUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as const;

// ERC20 ABI for cUSD approval
const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

// DailyTournament contract ABI (only needed functions)
const DAILY_TOURNAMENT_ABI = [
  {
    inputs: [],
    name: "payEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "submitScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentLeaderboard",
    outputs: [
      {
        components: [
          { internalType: "address", name: "playerAddress", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        internalType: "struct DailyTournament.Player[10]",
        name: "",
        type: "tuple[10]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface CeloRidersGameProps {
  contractAddress: `0x${string}`;
}

export default function CeloRidersGame({ contractAddress }: CeloRidersGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStaked, setHasStaked] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, title: '', message: '', type: 'info' });

  const { address, isConnected } = useAccount();
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: payEntry, data: payEntryHash } = useWriteContract();
  const { writeContract: submitScore, data: submitScoreHash } = useWriteContract();
  const { isMiniPay } = useMiniPay();
  const config = useConfig();

  const { isLoading: isApproving, isSuccess: hasApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Load staking status from localStorage on mount
  useEffect(() => {
    if (address) {
      const storageKey = `hasStaked_${address}_${contractAddress}`;
      const stored = localStorage.getItem(storageKey);
      if (stored === 'true') {
        setHasStaked(true);
      }
    }
  }, [address, contractAddress]);

  const { isLoading: isPayingEntry, isSuccess: hasEntryPaid } = useWaitForTransactionReceipt({
    hash: payEntryHash,
  });

  const { isLoading: isSubmittingOnChain, isSuccess: hasScoreSubmitted } = useWaitForTransactionReceipt({
    hash: submitScoreHash,
  });

  // Handle successful cUSD approval - automatically call payEntry
  useEffect(() => {
    if (hasApproved) {
      console.log('cUSD approved! Now calling payEntry...');
      try {
        payEntry({
          address: contractAddress,
          abi: DAILY_TOURNAMENT_ABI,
          functionName: 'payEntry',
        });
      } catch (error) {
        console.error('Error calling payEntry:', error);
        setNotification({
          show: true,
          title: 'Transaction Failed',
          message: 'Failed to pay entry fee. Please try again.',
          type: 'error'
        });
      }
    }
  }, [hasApproved, contractAddress, payEntry]);

  // Handle successful entry payment
  useEffect(() => {
    if (hasEntryPaid && address) {
      setHasStaked(true);
      // Persist to localStorage
      const storageKey = `hasStaked_${address}_${contractAddress}`;
      localStorage.setItem(storageKey, 'true');
      console.log('Entry fee paid successfully!');

      // Automatically start the game after staking
      window.dispatchEvent(new CustomEvent('stakeConfirmed'));
    }
  }, [hasEntryPaid, address, contractAddress]);

  // Handle successful score submission
  useEffect(() => {
    if (hasScoreSubmitted) {
      setIsSubmittingScore(false);
      setShowScoreModal(false);
      console.log('Score submitted to blockchain!');
      setNotification({
        show: true,
        title: 'Score Submitted! 🎉',
        message: `Your score of ${currentScore.toLocaleString()} has been submitted to the blockchain leaderboard!\n\nGood luck in the daily tournament!`,
        type: 'success'
      });
    }
  }, [hasScoreSubmitted, currentScore]);

  // Handle leaderboard requests from Phaser
  useEffect(() => {
    const handleLeaderboardRequest = async () => {
      console.log('[CeloRidersGame] Leaderboard requested. Connected:', isConnected);

      if (!isConnected) {
        console.log('[CeloRidersGame] Wallet not connected, sending error');
        window.dispatchEvent(new CustomEvent('leaderboardError', {
          detail: { error: 'Wallet not connected' }
        }));
        return;
      }

      try {
        console.log('[CeloRidersGame] Fetching leaderboard from blockchain...');
        const leaderboard = await readContract(config, {
          address: contractAddress,
          abi: DAILY_TOURNAMENT_ABI,
          functionName: 'getCurrentLeaderboard',
        });

        console.log('[CeloRidersGame] Raw leaderboard data:', leaderboard);

        // Transform to format expected by Phaser scene
        // Filter out empty entries (address = 0x0000...)
        const formattedData = leaderboard
          .map((player, index) => ({
            rank: index + 1,
            address: player.playerAddress,
            score: Number(player.score)
          }))
          .filter(entry => entry.address !== '0x0000000000000000000000000000000000000000' && entry.score > 0);

        console.log('[CeloRidersGame] Formatted leaderboard:', formattedData);

        window.dispatchEvent(new CustomEvent('leaderboardData', {
          detail: { leaderboard: formattedData }
        }));
      } catch (error: any) {
        console.error('[CeloRidersGame] Error fetching leaderboard:', error);
        window.dispatchEvent(new CustomEvent('leaderboardError', {
          detail: { error: error.message || 'Failed to fetch leaderboard' }
        }));
      }
    };

    window.addEventListener('requestLeaderboard', handleLeaderboardRequest);

    return () => {
      window.removeEventListener('requestLeaderboard', handleLeaderboardRequest);
    };
  }, [isConnected, contractAddress, config]);

  // Initialize Phaser game
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 640,
      height: 960,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 2000 },
          debug: false,
        },
      },
      scene: [
        Preload,
        Splash1,
        Splash2,
        Splash3,
        Splash4,
        Splash5,
        MainMenu,
        CharacterSelect,
        Game,
        GameOver,
        OptionsMenu,
        HowToPlay,
        Leaderboard,
      ],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Listen for game events
    const gameStartListener = (e: Event) => handleGameStart(e as CustomEvent);
    const gameOverListener = (e: Event) => handleGameOver(e as CustomEvent<{ score: number }>);

    window.addEventListener('gameStartRequested', gameStartListener);
    window.addEventListener('gameOver', gameOverListener);

    return () => {
      window.removeEventListener('gameStartRequested', gameStartListener);
      window.removeEventListener('gameOver', gameOverListener);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Handle game start - require wallet connection and staking
  const handleGameStart = async (_event: CustomEvent) => {
    console.log('Game start requested. Connected:', isConnected, 'Has staked:', hasStaked);

    if (!isConnected) {
      const message = isMiniPay
        ? 'MiniPay wallet not detected. Please ensure you are using MiniPay.'
        : 'Please connect your wallet to play CeloRiders!';
      setNotification({
        show: true,
        title: 'Wallet Not Connected',
        message,
        type: 'warning'
      });
      return;
    }

    if (!hasStaked) {
      console.log('No stake found, showing modal');
      // Show modal instead of confirm
      setShowStakeModal(true);
      return;
    }

    // Allow game to start
    console.log('Dispatching stakeConfirmed event');
    window.dispatchEvent(new CustomEvent('stakeConfirmed'));
  };

  const handleStakeConfirm = async () => {
    setShowStakeModal(false);

    try {
      console.log('Approving cUSD for contract...');
      // First approve the contract to spend 1 cUSD
      approveToken({
        address: CUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress, parseEther('1')],
      });
      // payEntry will be called automatically after approval succeeds (see useEffect above)
    } catch (error) {
      console.error('Error approving cUSD:', error);
      setNotification({
        show: true,
        title: 'Transaction Failed',
        message: 'Failed to approve cUSD. Please try again.',
        type: 'error'
      });
    }
  };

  const handleStakeCancel = () => {
    setShowStakeModal(false);
  };

  // Handle game over - submit score to blockchain
  const handleGameOver = async (event: CustomEvent<{ score: number }>) => {
    const score = event.detail.score;
    setCurrentScore(score);

    console.log('Game over! Score:', score);

    if (!isConnected || !hasStaked) {
      console.log('Not connected or not staked, skipping score submission');
      setNotification({
        show: true,
        title: 'Game Over!',
        message: `Your Score: ${score.toLocaleString()}\n\nConnect your wallet and stake 1 cUSD to submit scores to the blockchain leaderboard and compete for prizes!`,
        type: 'info'
      });
      return;
    }

    // Show score submission modal
    setShowScoreModal(true);
  };

  const handleScoreSubmitConfirm = async () => {
    setIsSubmittingScore(true);

    try {
      console.log('Submitting score to blockchain:', currentScore);
      submitScore({
        address: contractAddress,
        abi: DAILY_TOURNAMENT_ABI,
        functionName: 'submitScore',
        args: [BigInt(Math.floor(currentScore))],
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      setNotification({
        show: true,
        title: 'Submission Failed',
        message: 'Failed to submit score to the blockchain. Please try again.',
        type: 'error'
      });
      setIsSubmittingScore(false);
    }
  };

  const handleScoreSubmitCancel = () => {
    setShowScoreModal(false);
    console.log('Score submission cancelled');
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      {/* Game Container */}
      <div ref={containerRef} className="game-container" />

      {/* Stake Modal */}
      <StakeModal
        isOpen={showStakeModal}
        onConfirm={handleStakeConfirm}
        onCancel={handleStakeCancel}
        isMiniPay={isMiniPay}
      />

      {/* Score Submit Modal */}
      <ScoreSubmitModal
        isOpen={showScoreModal}
        score={currentScore}
        onConfirm={handleScoreSubmitConfirm}
        onCancel={handleScoreSubmitCancel}
        isSubmitting={isSubmittingScore}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.show}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Overlay UI */}
      {!isConnected && !isMiniPay && (
        <div className="absolute top-4 left-0 right-0 text-center px-4">
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg inline-block font-bold text-sm sm:text-base">
            Connect your wallet to play CeloRiders!
          </div>
        </div>
      )}

      {isConnected && !hasStaked && !isMiniPay && (
        <div className="absolute top-4 left-0 right-0 text-center px-4">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block font-bold text-sm sm:text-base">
            Stake 1 cUSD to play!
          </div>
        </div>
      )}

      {(isApproving || isPayingEntry) && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="font-bold text-base sm:text-lg text-center">
              {isApproving
                ? 'Approving cUSD...'
                : (isMiniPay ? 'Processing payment via MiniPay...' : 'Processing entry payment...')
              }
            </p>
            {isApproving && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                Step 1 of 2: Approving token
              </p>
            )}
            {isPayingEntry && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                Step 2 of 2: Paying entry fee
              </p>
            )}
          </div>
        </div>
      )}

      {isSubmittingOnChain && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="font-bold text-base sm:text-lg text-center">Submitting score to blockchain...</p>
          </div>
        </div>
      )}

      {/* Wallet Info */}
      {isConnected && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-10 text-white px-4 py-2 rounded-lg text-sm">
          <p className="font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          {hasStaked && (
            <p className="text-green-400 text-xs mt-1">✓ Staked</p>
          )}
        </div>
      )}

      <style jsx>{`
        .game-container {
          max-width: 100vw;
          max-height: 100vh;
        }
      `}</style>
    </div>
  );
}
