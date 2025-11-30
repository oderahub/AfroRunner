"use client";

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
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

  const { isMiniPay } = useMiniPay();

  // Auto-connect for MiniPay demo
  useEffect(() => {
    // Simulate being connected in MiniPay
    setHasStaked(true); // Auto-staked for demo
  }, []);

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
    const gameStartListener = () => handleGameStart();
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

  // Handle game start - auto start for demo
  const handleGameStart = async () => {
    // Auto-start game for demo
    window.dispatchEvent(new CustomEvent('stakeConfirmed'));
  };

  // DEMO MODE: Simulated staking process
  const handleStakeConfirm = async () => {
    setShowStakeModal(false);

    setNotification({
      show: true,
      title: 'Payment Successful! 🎉',
      message: 'Successfully staked 1 cUSD. Game starting...',
      type: 'success'
    });

    setHasStaked(true);

    // Automatically start the game after staking
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('stakeConfirmed'));
    }, 1000);
  };

  const handleStakeCancel = () => {
    setShowStakeModal(false);
  };

  // Handle game over - submit score (simulated)
  const handleGameOver = async (event: CustomEvent<{ score: number }>) => {
    const score = event.detail.score;
    setCurrentScore(score);

    setShowScoreModal(true);
  };

  // DEMO MODE: Simulated score submission
  const handleScoreSubmitConfirm = async () => {
    setIsSubmittingScore(true);

    try {
      // Simulate blockchain submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success!
      setIsSubmittingScore(false);
      setShowScoreModal(false);
      setNotification({
        show: true,
        title: 'Score Submitted! 🎉',
        message: `Your score of ${currentScore.toLocaleString()} has been submitted to the blockchain leaderboard!`,
        type: 'success'
      });
    } catch (error) {
      setIsSubmittingScore(false);
    }
  };

  const handleScoreSubmitCancel = () => {
    setShowScoreModal(false);
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

      {/* Loading Overlay for Score Submission */}
      {isSubmittingScore && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="font-bold text-base sm:text-lg text-center">
              Submitting Score
            </p>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Saving your score to the blockchain...
            </p>
          </div>
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









// "use client";

// import { useEffect, useRef, useState } from 'react';
// import * as Phaser from 'phaser';
// import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
// import { parseEther } from 'viem';
// import { readContract } from 'wagmi/actions';
// import { useMiniPay } from '@/hooks/useMiniPay';
// import { StakeModal } from './StakeModal';
// import { ScoreSubmitModal } from './ScoreSubmitModal';
// import { NotificationModal } from './NotificationModal';

// // Import game scenes
// import Preload from '../game/scenes/Preload';
// import Splash1 from '../game/scenes/Splash1';
// import Splash2 from '../game/scenes/Splash2';
// import Splash3 from '../game/scenes/Splash3';
// import Splash4 from '../game/scenes/Splash4';
// import Splash5 from '../game/scenes/Splash5';
// import MainMenu from '../game/scenes/MainMenu';
// import CharacterSelect from '../game/scenes/CharacterSelect';
// import Game from '../game/scenes/Game';
// import GameOver from '../game/scenes/GameOver';
// import OptionsMenu from '../game/scenes/OptionsMenu';
// import HowToPlay from '../game/scenes/HowToPlay';
// import Leaderboard from '../game/scenes/Leaderboard';

// // cUSD token address on Celo Sepolia testnet
// const CUSD_ADDRESS = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b' as const;

// // ERC20 ABI for cUSD approval and balance checks
// const ERC20_ABI = [
//   {
//     inputs: [
//       { internalType: "address", name: "spender", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" }
//     ],
//     name: "approve",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [{ internalType: "address", name: "account", type: "address" }],
//     name: "balanceOf",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function"
//   },
//   {
//     inputs: [
//       { internalType: "address", name: "owner", type: "address" },
//       { internalType: "address", name: "spender", type: "address" }
//     ],
//     name: "allowance",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function"
//   }
// ] as const;

// // DailyTournament contract ABI
// const DAILY_TOURNAMENT_ABI = [
//   {
//     inputs: [],
//     name: "payEntry",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
//     name: "submitScore",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [],
//     name: "getCurrentLeaderboard",
//     outputs: [
//       {
//         components: [
//           { internalType: "address", name: "playerAddress", type: "address" },
//           { internalType: "uint256", name: "score", type: "uint256" },
//           { internalType: "uint256", name: "timestamp", type: "uint256" }
//         ],
//         internalType: "struct DailyTournament.Player[10]",
//         name: "",
//         type: "tuple[10]"
//       }
//     ],
//     stateMutability: "view",
//     type: "function"
//   },
//   {
//     inputs: [],
//     name: "resetTournament",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [],
//     name: "needsReset",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "view",
//     type: "function"
//   },
//   {
//     inputs: [],
//     name: "currentDayId",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function"
//   }
// ] as const;

// interface CeloRidersGameProps {
//   contractAddress: `0x${string}`;
// }

// export default function CeloRidersGame({ contractAddress }: CeloRidersGameProps) {
//   // 🚨 CRITICAL FIX: FORCE THE CORRECT CONTRACT ADDRESS
//   const CORRECT_CONTRACT_ADDRESS = '0x0fA17619c768416b8246aAC388DCd66a23695eb4' as const;
//   contractAddress = CORRECT_CONTRACT_ADDRESS;

//   const gameRef = useRef<Phaser.Game | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [hasStaked, setHasStaked] = useState(false);
//   const [showStakeModal, setShowStakeModal] = useState(false);
//   const [showScoreModal, setShowScoreModal] = useState(false);
//   const [currentScore, setCurrentScore] = useState(0);
//   const [isSubmittingScore, setIsSubmittingScore] = useState(false);
//   const [debugState, setDebugState] = useState<string>('idle');
//   const [debugDetails, setDebugDetails] = useState<string>('');
//   const [userBalance, setUserBalance] = useState<number>(0);
//   const [userAllowance, setUserAllowance] = useState<number>(0);
//   const [tournamentState, setTournamentState] = useState<{currentDayId?: string, needsReset?: boolean}>({});
//   const [notification, setNotification] = useState<{
//     show: boolean;
//     title: string;
//     message: string;
//     type: 'success' | 'error' | 'info' | 'warning';
//   }>({ show: false, title: '', message: '', type: 'info' });

//   const { address, isConnected, chain } = useAccount();
//   const { writeContract: approveToken, data: approveHash, error: approveError } = useWriteContract();
//   const { writeContract: payEntry, data: payEntryHash, error: payEntryError } = useWriteContract();
//   const { writeContract: submitScore, data: submitScoreHash, error: submitScoreError } = useWriteContract();
//   const { writeContract: resetTournament } = useWriteContract();
//   const { isMiniPay } = useMiniPay();
//   const config = useConfig();

//   // 🆕 ADDED: Missing hook for approve transaction
//   const { isLoading: isApproving, isSuccess: hasApproved } = useWaitForTransactionReceipt({
//     hash: approveHash,
//   });

//   // 🆕 ADDED: Missing hook for payEntry transaction
//   const { isLoading: isPayingEntry, isSuccess: hasEntryPaid } = useWaitForTransactionReceipt({
//     hash: payEntryHash,
//   });

//   // 🆕 ADDED: Missing hook for submitScore transaction
//   const { isLoading: isSubmittingOnChain, isSuccess: hasScoreSubmitted } = useWaitForTransactionReceipt({
//     hash: submitScoreHash,
//   });

//   // 🆕 ADDED: Load user balance and allowance on connect
//   useEffect(() => {
//     const loadUserData = async () => {
//       if (!address || !isConnected) return;

//       try {
//         setDebugState('loading_user_data');
        
//         // Check balance
//         const balance = await readContract(config, {
//           address: CUSD_ADDRESS,
//           abi: ERC20_ABI,
//           functionName: 'balanceOf',
//           args: [address]
//         });
//         const balanceInCUSD = parseFloat(balance.toString()) / 1e18;
//         setUserBalance(balanceInCUSD);

//         // Check allowance
//         const allowance = await readContract(config, {
//           address: CUSD_ADDRESS,
//           abi: ERC20_ABI,
//           functionName: 'allowance',
//           args: [address, contractAddress]
//         });
//         const allowanceInCUSD = parseFloat(allowance.toString()) / 1e18;
//         setUserAllowance(allowanceInCUSD);

//         setDebugDetails(`Balance: ${balanceInCUSD.toFixed(2)} cUSD | Allowance: ${allowanceInCUSD.toFixed(2)} cUSD`);
//         setDebugState('user_data_loaded');
//       } catch (error) {
//         setDebugState('error_loading_data');
//         setDebugDetails('Failed to load user data');
//       }
//     };

//     loadUserData();
//   }, [address, isConnected, contractAddress, config]);

//   // 🆕 ADDED: Check tournament state on connect
//   useEffect(() => {
//     const checkTournamentState = async () => {
//       if (!isConnected) return;

//       try {
//         setDebugState('checking_tournament_state');
        
//         const currentDayId = await readContract(config, {
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'currentDayId',
//         });

//         const needsReset = await readContract(config, {
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'needsReset',
//         });

//         setTournamentState({
//           currentDayId: currentDayId.toString(),
//           needsReset
//         });

//         setDebugDetails(`Day ID: ${currentDayId.toString()} | Needs Reset: ${needsReset}`);
        
//         if (needsReset) {
//           setNotification({
//             show: true,
//             title: 'Tournament Needs Reset',
//             message: 'The tournament needs to be reset before you can play. Click the FORCE RESET button.',
//             type: 'warning'
//           });
//         }
        
//       } catch (error) {
//         setDebugState('error_tournament_check');
//         setDebugDetails('Failed to check tournament state');
//       }
//     };

//     if (isConnected) {
//       checkTournamentState();
//     }
//   }, [isConnected, contractAddress, config]);

//   // 🆕 ADDED: Enhanced tournament reset with visual feedback
//   const checkAndResetTournament = async (): Promise<boolean> => {
//     try {
//       setDebugState('checking_tournament');
//       setDebugDetails('Checking if tournament needs reset...');
      
//       const needsReset = await readContract(config, {
//         address: contractAddress,
//         abi: DAILY_TOURNAMENT_ABI,
//         functionName: 'needsReset',
//       });

//       if (needsReset) {
//         setDebugState('resetting_tournament');
//         setDebugDetails('Resetting tournament for new day...');
        
//         setNotification({
//           show: true,
//           title: 'Resetting Tournament',
//           message: 'Daily tournament is being reset. This may take a moment...',
//           type: 'info'
//         });

//         resetTournament({
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'resetTournament',
//           gas: BigInt(500000),
//         } as any);
        
//         // Wait for reset
//         await new Promise(resolve => setTimeout(resolve, 8000));
//         setDebugDetails('Tournament reset complete');
//         return true;
//       }
      
//       setDebugDetails('Tournament is ready');
//       return false;
//     } catch (error) {
//       setDebugState('error_tournament');
//       setDebugDetails('Tournament reset failed');
//       return false;
//     }
//   };

//   // 🆕 ADDED: Manual tournament reset function
//   const manualForceReset = async () => {
//     try {
//       setDebugState('manual_force_reset');
//       setDebugDetails('Forcing tournament reset...');
      
//       setNotification({
//         show: true,
//         title: 'Force Resetting Tournament',
//         message: 'This will manually reset the tournament. Please wait...',
//         type: 'info'
//       });

//       // Call resetTournament directly
//       resetTournament({
//         address: contractAddress,
//         abi: DAILY_TOURNAMENT_ABI,
//         functionName: 'resetTournament',
//         gas: BigInt(500000),
//       } as any);

//       // Wait for reset
//       await new Promise(resolve => setTimeout(resolve, 8000));
      
//       setDebugState('manual_reset_complete');
//       setDebugDetails('Manual reset complete. Try staking now.');
      
//       // Refresh tournament state
//       const checkTournamentState = async () => {
//         const currentDayId = await readContract(config, {
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'currentDayId',
//         });

//         const needsReset = await readContract(config, {
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'needsReset',
//         });

//         setTournamentState({
//           currentDayId: currentDayId.toString(),
//           needsReset
//         });
//       };
      
//       await checkTournamentState();
      
//       setNotification({
//         show: true,
//         title: 'Reset Complete',
//         message: 'Tournament has been manually reset. Try staking now!',
//         type: 'success'
//       });

//     } catch (error) {
//       setDebugState('error_manual_reset');
//       setDebugDetails('Manual reset failed');
//       setNotification({
//         show: true,
//         title: 'Reset Failed',
//         message: 'Manual reset failed. Please try again.',
//         type: 'error'
//       });
//     }
//   };

//   // Debug: Log any transaction errors
//   useEffect(() => {
//     if (approveError) {
//       setDebugState('error_approve');
//       setDebugDetails('Approval transaction failed');
//       setNotification({
//         show: true,
//         title: 'Approval Failed',
//         message: 'Failed to approve cUSD. Please try again.',
//         type: 'error'
//       });
//     }
//   }, [approveError]);

//   useEffect(() => {
//     if (payEntryError) {
//       setDebugState('error_payment');
//       setDebugDetails('Payment transaction failed - check contract');
//       setNotification({
//         show: true,
//         title: 'Payment Failed',
//         message: 'Contract execution failed. The tournament might need to be reset.',
//         type: 'error'
//       });
//     }
//   }, [payEntryError]);

//   useEffect(() => {
//     if (submitScoreError) {
//       setDebugState('error_score');
//       setDebugDetails('Score submission failed');
//       setNotification({
//         show: true,
//         title: 'Score Submission Failed',
//         message: 'Failed to submit score to blockchain',
//         type: 'error'
//       });
//     }
//   }, [submitScoreError]);

//   // Handle successful cUSD approval - automatically call payEntry
//   useEffect(() => {
//     if (hasApproved && approveHash) {
//       setDebugState('approval_success');
//       setDebugDetails('cUSD approved! Processing payment...');
      
//       setNotification({
//         show: true,
//         title: 'Approval Complete!',
//         message: 'cUSD approved! Now processing payment...',
//         type: 'success'
//       });

//       const proceedWithPayment = async () => {
//         try {
//           await new Promise(resolve => setTimeout(resolve, 2000));

//           setDebugState('processing_payment');
//           setDebugDetails('Sending payment to contract...');
          
//           // Check and reset tournament if needed
//           await checkAndResetTournament();
          
//           // 🛠️ UPDATED: Enhanced payEntry with better gas settings
//           payEntry({
//             address: contractAddress,
//             abi: DAILY_TOURNAMENT_ABI,
//             functionName: 'payEntry',
//             gas: BigInt(800000),
//             maxFeePerGas: BigInt(3000000000),
//             maxPriorityFeePerGas: BigInt(3000000000),
//           } as any);
          
//         } catch (error: any) {
//           setDebugState('error_payment_after_approval');
//           setDebugDetails('Payment failed after approval');
//           setNotification({
//             show: true,
//             title: 'Payment Failed',
//             message: 'Approval succeeded but payment failed. Please try again.',
//             type: 'error'
//           });
//         }
//       };

//       proceedWithPayment();
//     }
//   }, [hasApproved, approveHash, contractAddress, payEntry, config]);

//   // Handle successful entry payment
//   useEffect(() => {
//     if (hasEntryPaid && address && payEntryHash) {
//       setHasStaked(true);
//       setDebugState('payment_success');
//       setDebugDetails('Payment successful! You can now play.');

//       // Persist to localStorage
//       const storageKey = `hasStaked_${address}_${contractAddress}`;
//       localStorage.setItem(storageKey, 'true');

//       // Automatically start the game after staking
//       window.dispatchEvent(new CustomEvent('stakeConfirmed'));
//     }
//   }, [hasEntryPaid, address, contractAddress, payEntryHash]);

//   // Handle successful score submission
//   useEffect(() => {
//     if (hasScoreSubmitted) {
//       setIsSubmittingScore(false);
//       setShowScoreModal(false);
//       setDebugState('score_submitted');
//       setDebugDetails('Score submitted to blockchain');
//       setNotification({
//         show: true,
//         title: 'Score Submitted! 🎉',
//         message: `Your score of ${currentScore.toLocaleString()} has been submitted to the blockchain leaderboard!`,
//         type: 'success'
//       });
//     }
//   }, [hasScoreSubmitted, currentScore]);

//   // Initialize Phaser game
//   useEffect(() => {
//     if (!containerRef.current || gameRef.current) return;

//     const config: Phaser.Types.Core.GameConfig = {
//       type: Phaser.AUTO,
//       parent: containerRef.current,
//       width: 640,
//       height: 960,
//       backgroundColor: '#000000',
//       physics: {
//         default: 'arcade',
//         arcade: {
//           gravity: { x: 0, y: 2000 },
//           debug: false,
//         },
//       },
//       scene: [
//         Preload,
//         Splash1,
//         Splash2,
//         Splash3,
//         Splash4,
//         Splash5,
//         MainMenu,
//         CharacterSelect,
//         Game,
//         GameOver,
//         OptionsMenu,
//         HowToPlay,
//         Leaderboard,
//       ],
//       scale: {
//         mode: Phaser.Scale.FIT,
//         autoCenter: Phaser.Scale.CENTER_BOTH,
//       },
//     };

//     gameRef.current = new Phaser.Game(config);

//     // Listen for game events
//     const gameStartListener = (e: Event) => handleGameStart(e as CustomEvent);
//     const gameOverListener = (e: Event) => handleGameOver(e as CustomEvent<{ score: number }>);

//     window.addEventListener('gameStartRequested', gameStartListener);
//     window.addEventListener('gameOver', gameOverListener);

//     return () => {
//       window.removeEventListener('gameStartRequested', gameStartListener);
//       window.removeEventListener('gameOver', gameOverListener);

//       if (gameRef.current) {
//         gameRef.current.destroy(true);
//         gameRef.current = null;
//       }
//     };
//   }, []);

//   // Handle game start - require wallet connection and staking
//   const handleGameStart = async (_event: CustomEvent) => {
//     if (!isConnected) {
//       const message = isMiniPay
//         ? 'MiniPay wallet not detected. Please ensure you are using MiniPay.'
//         : 'Please connect your wallet to play CeloRiders!';
//       setNotification({
//         show: true,
//         title: 'Wallet Not Connected',
//         message,
//         type: 'warning'
//       });
//       return;
//     }

//     if (!hasStaked) {
//       setShowStakeModal(true);
//       return;
//     }

//     window.dispatchEvent(new CustomEvent('stakeConfirmed'));
//   };

//   // 🛠️ FIXED: Enhanced handleStakeConfirm with better visual feedback
//   const handleStakeConfirm = async () => {
//     setDebugState('starting');
//     setDebugDetails('Starting staking process...');

//     if (!isConnected || !address) {
//       setDebugState('error_wallet');
//       setDebugDetails('Wallet not connected');
//       setNotification({
//         show: true,
//         title: 'Wallet Not Connected',
//         message: 'Please connect your wallet first.',
//         type: 'error'
//       });
//       return;
//     }

//     setShowStakeModal(false);

//     try {
//       // Step 1: Check balance
//       setDebugState('checking_balance');
//       setDebugDetails('Checking your cUSD balance...');

//       if (userBalance < 1) {
//         setDebugState('error_balance');
//         setDebugDetails(`Insufficient balance: ${userBalance.toFixed(2)} cUSD`);
//         setNotification({
//           show: true,
//           title: 'Insufficient Balance',
//           message: `You need at least 1 cUSD. Current balance: ${userBalance.toFixed(2)} cUSD`,
//           type: 'error'
//         });
//         return;
//       }

//       // Step 2: Check allowance
//       setDebugState('checking_allowance');
//       setDebugDetails('Checking contract permissions...');

//       if (userAllowance < 1) {
//         // NEED APPROVAL
//         setDebugState('requesting_approval');
//         setDebugDetails('Requesting cUSD approval in MiniPay...');
//         setNotification({
//           show: true,
//           title: 'Approval Required',
//           message: 'Please approve cUSD spending in MiniPay. Look for the approval request!',
//           type: 'info'
//         });

//         approveToken({
//           address: CUSD_ADDRESS,
//           abi: ERC20_ABI,
//           functionName: 'approve',
//           args: [contractAddress, parseEther('1')],
//           gas: BigInt(100000),
//         } as any);

//       } else {
//         // ALREADY APPROVED - GO DIRECTLY TO PAYMENT
//         setDebugState('already_approved');
//         setDebugDetails('Found existing approval, processing payment...');
//         setNotification({
//           show: true,
//           title: 'Processing Payment...',
//           message: 'Found existing approval, processing payment now',
//           type: 'info'
//         });

//         await new Promise(resolve => setTimeout(resolve, 1500));
        
//         // Enhanced tournament check
//         await checkAndResetTournament();
        
//         setDebugState('sending_payment');
//         setDebugDetails('Sending payment transaction...');
        
//         payEntry({
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'payEntry',
//           gas: BigInt(800000),
//           maxFeePerGas: BigInt(3000000000),
//           maxPriorityFeePerGas: BigInt(3000000000),
//         } as any);
//       }

//     } catch (error: any) {
//       setDebugState('error_general');
//       setDebugDetails('General error during staking');
//       setNotification({
//         show: true,
//         title: 'Transaction Failed',
//         message: 'Please check MiniPay for transaction details and try again.',
//         type: 'error'
//       });
//     }
//   };

//   const handleStakeCancel = () => {
//     setShowStakeModal(false);
//     setDebugState('cancelled');
//     setDebugDetails('Staking cancelled by user');
//   };

//   // Handle game over - submit score to blockchain
//   const handleGameOver = async (event: CustomEvent<{ score: number }>) => {
//     const score = event.detail.score;
//     setCurrentScore(score);

//     if (!isConnected || !hasStaked) {
//       setNotification({
//         show: true,
//         title: 'Game Over!',
//         message: `Your Score: ${score.toLocaleString()}\n\nConnect your wallet and stake 1 cUSD to submit scores to the blockchain leaderboard!`,
//         type: 'info'
//       });
//       return;
//     }

//     setShowScoreModal(true);
//   };

//   const handleScoreSubmitConfirm = async () => {
//     setIsSubmittingScore(true);
//     setDebugState('submitting_score');
//     setDebugDetails('Submitting score to blockchain...');

//     try {
//       submitScore({
//         address: contractAddress,
//         abi: DAILY_TOURNAMENT_ABI,
//         functionName: 'submitScore',
//         args: [BigInt(Math.floor(currentScore))],
//         gas: BigInt(200000),
//       } as any);
//     } catch (error) {
//       setDebugState('error_score_submit');
//       setDebugDetails('Score submission failed');
//       setNotification({
//         show: true,
//         title: 'Submission Failed',
//         message: 'Failed to submit score to the blockchain. Please try again.',
//         type: 'error'
//       });
//       setIsSubmittingScore(false);
//     }
//   };

//   const handleScoreSubmitCancel = () => {
//     setShowScoreModal(false);
//     setDebugState('score_cancelled');
//     setDebugDetails('Score submission cancelled');
//   };

//   return (
//     <div className="relative w-full h-screen bg-black flex items-center justify-center">
//       {/* Game Container */}
//       <div ref={containerRef} className="game-container" />

//       {/* Enhanced Debug Info */}
//       <div className="absolute top-20 left-4 bg-black bg-opacity-90 text-white px-3 py-2 rounded text-xs z-50 border border-yellow-500">
//         <div className="font-bold mb-1">🚀 DEBUG PANEL</div>
//         <div className="mb-1">
//           <span className="text-yellow-400">State:</span> {debugState}
//         </div>
//         <div className="mb-1">
//           <span className="text-yellow-400">Details:</span> {debugDetails}
//         </div>
//         <div className="grid grid-cols-2 gap-1 text-xs mt-1">
//           <div>Balance: <span className={userBalance >= 1 ? "text-green-400" : "text-red-400"}>{userBalance.toFixed(2)} cUSD</span></div>
//           <div>Allowance: <span className={userAllowance >= 1 ? "text-green-400" : "text-yellow-400"}>{userAllowance.toFixed(2)} cUSD</span></div>
//           <div>Approving: <span className={isApproving ? "text-blue-400" : "text-gray-400"}>{isApproving ? "YES" : "NO"}</span></div>
//           <div>Paying: <span className={isPayingEntry ? "text-blue-400" : "text-gray-400"}>{isPayingEntry ? "YES" : "NO"}</span></div>
//           <div>Staked: <span className={hasStaked ? "text-green-400" : "text-red-400"}>{hasStaked ? "YES" : "NO"}</span></div>
//           <div>Connected: <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "YES" : "NO"}</span></div>
//         </div>
//         {tournamentState.currentDayId && (
//           <div className="mt-1 text-xs border-t border-gray-600 pt-1">
//             <div>Day ID: {tournamentState.currentDayId}</div>
//             <div>Needs Reset: <span className={tournamentState.needsReset ? "text-red-400" : "text-green-400"}>{tournamentState.needsReset ? "YES" : "NO"}</span></div>
//           </div>
//         )}
//       </div>

//       {/* Manual reset button */}
//       <button 
//         onClick={manualForceReset}
//         className="absolute top-44 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs z-50 font-bold border border-red-300"
//       >
//         🔄 FORCE RESET TOURNAMENT
//       </button>

//       {/* Stake Modal */}
//       <StakeModal
//         isOpen={showStakeModal}
//         onConfirm={handleStakeConfirm}
//         onCancel={handleStakeCancel}
//         isMiniPay={isMiniPay}
//       />

//       {/* Score Submit Modal */}
//       <ScoreSubmitModal
//         isOpen={showScoreModal}
//         score={currentScore}
//         onConfirm={handleScoreSubmitConfirm}
//         onCancel={handleScoreSubmitCancel}
//         isSubmitting={isSubmittingScore}
//       />

//       {/* Notification Modal */}
//       <NotificationModal
//         isOpen={notification.show}
//         title={notification.title}
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ ...notification, show: false })}
//       />

//       {/* Transaction Loading Overlays */}
//       {(isApproving || isPayingEntry) && (
//         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p className="font-bold text-base sm:text-lg text-center">
//               {isApproving ? 'Approve in MiniPay' : 'Processing Payment...'}
//             </p>
//             <p className="text-sm text-gray-600 mt-2 text-center">
//               {isApproving 
//                 ? 'Step 1: Approve cUSD spending' 
//                 : 'Step 2: Paying entry fee'
//               }
//               {isMiniPay && <><br />Check MiniPay for the request</>}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Wallet Info */}
//       {isConnected && (
//         <div className="absolute bottom-4 right-4 bg-white bg-opacity-10 text-white px-4 py-2 rounded-lg text-sm">
//           <p className="font-mono">
//             {address?.slice(0, 6)}...{address?.slice(-4)}
//           </p>
//           {hasStaked && (
//             <p className="text-green-400 text-xs mt-1">✓ Staked</p>
//           )}
//         </div>
//       )}

//       <style jsx>{`
//         .game-container {
//           max-width: 100vw;
//           max-height: 100vh;
//         }
//       `}</style>
//     </div>
//   );
// }






// "use client";

// import { useEffect, useRef, useState } from 'react';
// import * as Phaser from 'phaser';
// import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
// import { parseEther } from 'viem';
// import { readContract } from 'wagmi/actions';
// import { useMiniPay } from '@/hooks/useMiniPay';
// import { StakeModal } from './StakeModal';
// import { ScoreSubmitModal } from './ScoreSubmitModal';
// import { NotificationModal } from './NotificationModal';

// // Import game scenes
// import Preload from '../game/scenes/Preload';
// import Splash1 from '../game/scenes/Splash1';
// import Splash2 from '../game/scenes/Splash2';
// import Splash3 from '../game/scenes/Splash3';
// import Splash4 from '../game/scenes/Splash4';
// import Splash5 from '../game/scenes/Splash5';
// import MainMenu from '../game/scenes/MainMenu';
// import CharacterSelect from '../game/scenes/CharacterSelect';
// import Game from '../game/scenes/Game';
// import GameOver from '../game/scenes/GameOver';
// import OptionsMenu from '../game/scenes/OptionsMenu';
// import HowToPlay from '../game/scenes/HowToPlay';
// import Leaderboard from '../game/scenes/Leaderboard';

// // cUSD token address on Celo Sepolia testnet
// // Source: https://docs.celo.org/token-addresses
// // Using the ERC20 cUSD variant
// const CUSD_ADDRESS = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b' as const;

// // ERC20 ABI for cUSD approval
// const ERC20_ABI = [
//   {
//     inputs: [
//       { internalType: "address", name: "spender", type: "address" },
//       { internalType: "uint256", name: "amount", type: "uint256" }
//     ],
//     name: "approve",
//     outputs: [{ internalType: "bool", name: "", type: "bool" }],
//     stateMutability: "nonpayable",
//     type: "function"
//   }
// ] as const;

// // DailyTournament contract ABI (only needed functions)
// const DAILY_TOURNAMENT_ABI = [
//   {
//     inputs: [],
//     name: "payEntry",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
//     name: "submitScore",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function"
//   },
//   {
//     inputs: [],
//     name: "getCurrentLeaderboard",
//     outputs: [
//       {
//         components: [
//           { internalType: "address", name: "playerAddress", type: "address" },
//           { internalType: "uint256", name: "score", type: "uint256" },
//           { internalType: "uint256", name: "timestamp", type: "uint256" }
//         ],
//         internalType: "struct DailyTournament.Player[10]",
//         name: "",
//         type: "tuple[10]"
//       }
//     ],
//     stateMutability: "view",
//     type: "function"
//   }
// ] as const;

// interface CeloRidersGameProps {
//   contractAddress: `0x${string}`;
// }

// export default function CeloRidersGame({ contractAddress }: CeloRidersGameProps) {
//   const gameRef = useRef<Phaser.Game | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [hasStaked, setHasStaked] = useState(false);
//   const [showStakeModal, setShowStakeModal] = useState(false);
//   const [showScoreModal, setShowScoreModal] = useState(false);
//   const [currentScore, setCurrentScore] = useState(0);
//   const [isSubmittingScore, setIsSubmittingScore] = useState(false);
//   const [notification, setNotification] = useState<{
//     show: boolean;
//     title: string;
//     message: string;
//     type: 'success' | 'error' | 'info' | 'warning';
//   }>({ show: false, title: '', message: '', type: 'info' });

//   const { address, isConnected, chain } = useAccount();
//   const { writeContract: approveToken, data: approveHash, error: approveError } = useWriteContract();
//   const { writeContract: payEntry, data: payEntryHash, error: payEntryError } = useWriteContract();
//   const { writeContract: submitScore, data: submitScoreHash, error: submitScoreError } = useWriteContract();
//   const { isMiniPay } = useMiniPay();
//   const config = useConfig();

//   // Debug: Log any transaction errors
//   useEffect(() => {
//     if (approveError) {
//       console.error('[STAKING] ❌ Approve error:', approveError);
//       setNotification({
//         show: true,
//         title: 'Approval Failed',
//         message: approveError.message || 'Failed to approve cUSD',
//         type: 'error'
//       });
//     }
//   }, [approveError]);

//   useEffect(() => {
//     if (payEntryError) {
//       console.error('[STAKING] ❌ PayEntry error:', payEntryError);
//       setNotification({
//         show: true,
//         title: 'Payment Failed',
//         message: payEntryError.message || 'Failed to pay entry fee',
//         type: 'error'
//       });
//     }
//   }, [payEntryError]);

//   useEffect(() => {
//     if (submitScoreError) {
//       console.error('[SCORE] ❌ Submit error:', submitScoreError);
//       setNotification({
//         show: true,
//         title: 'Score Submission Failed',
//         message: submitScoreError.message || 'Failed to submit score',
//         type: 'error'
//       });
//     }
//   }, [submitScoreError]);

//   // Debug: Log current chain
//   useEffect(() => {
//     if (chain) {
//       console.log('[NETWORK] 🌐 Connected to:', chain.id, chain.name);
//       if (chain.id !== 11142220 && chain.id !== 42220) {
//         console.warn('[NETWORK] ⚠️ Wrong network! Expected Celo Sepolia (11142220) or Celo Mainnet (42220)');
//         setNotification({
//           show: true,
//           title: 'Wrong Network',
//           message: 'Please switch to Celo Sepolia Testnet in MiniPay settings',
//           type: 'warning'
//         });
//       }
//     }
//   }, [chain]);

//   const { isLoading: isApproving, isSuccess: hasApproved } = useWaitForTransactionReceipt({
//     hash: approveHash,
//   });

//   // Debug: Track approve transaction state
//   useEffect(() => {
//     if (approveHash) {
//       console.log('[STAKING] 📊 Approve hash received:', approveHash);
//       console.log('[STAKING] 📊 isApproving:', isApproving, 'hasApproved:', hasApproved);
//     }
//   }, [approveHash, isApproving, hasApproved]);

//   // Load staking status from localStorage on mount
//   useEffect(() => {
//     if (address) {
//       const storageKey = `hasStaked_${address}_${contractAddress}`;
//       const stored = localStorage.getItem(storageKey);
//       if (stored === 'true') {
//         console.log('[STAKING] 💾 Found existing stake in localStorage');
//         setHasStaked(true);
//       }
//     }
//   }, [address, contractAddress]);

//   const { isLoading: isPayingEntry, isSuccess: hasEntryPaid } = useWaitForTransactionReceipt({
//     hash: payEntryHash,
//   });

//   // Debug: Track payEntry transaction state
//   useEffect(() => {
//     if (payEntryHash) {
//       console.log('[STAKING] 📊 PayEntry hash received:', payEntryHash);
//       console.log('[STAKING] 📊 isPayingEntry:', isPayingEntry, 'hasEntryPaid:', hasEntryPaid);
//     }
//   }, [payEntryHash, isPayingEntry, hasEntryPaid]);

//   const { isLoading: isSubmittingOnChain, isSuccess: hasScoreSubmitted } = useWaitForTransactionReceipt({
//     hash: submitScoreHash,
//   });

//   // Handle successful cUSD approval - automatically call payEntry
//   useEffect(() => {
//     if (hasApproved && approveHash) {
//       console.log('[STAKING] ✅ cUSD approved! Hash:', approveHash);
//       console.log('[STAKING] 🔄 Checking allowance before calling payEntry...');

//       // Add a small delay to ensure approval is propagated on-chain
//       const checkAllowanceAndPay = async () => {
//         try {
//           // Wait a bit for the approval to be fully propagated
//           await new Promise(resolve => setTimeout(resolve, 2000));

//           // Check the balance first
//           const balance = await readContract(config, {
//             address: CUSD_ADDRESS,
//             abi: [{
//               inputs: [{ name: "account", type: "address" }],
//               name: "balanceOf",
//               outputs: [{ name: "", type: "uint256" }],
//               stateMutability: "view",
//               type: "function"
//             }],
//             functionName: 'balanceOf',
//             args: [address!]
//           });

//           const balanceInCUSD = parseFloat(balance.toString()) / 1e18;
//           console.log('[STAKING] 💰 cUSD Balance:', balanceInCUSD, 'cUSD');

//           if (balanceInCUSD < 1) {
//             console.error('[STAKING] ❌ Insufficient balance:', balanceInCUSD);
//             setNotification({
//               show: true,
//               title: 'Insufficient Balance',
//               message: `You need at least 1 cUSD. Current balance: ${balanceInCUSD.toFixed(2)} cUSD`,
//               type: 'error'
//             });
//             return;
//           }

//           // Check the allowance
//           const allowance = await readContract(config, {
//             address: CUSD_ADDRESS,
//             abi: [{
//               inputs: [
//                 { name: "owner", type: "address" },
//                 { name: "spender", type: "address" }
//               ],
//               name: "allowance",
//               outputs: [{ name: "", type: "uint256" }],
//               stateMutability: "view",
//               type: "function"
//             }],
//             functionName: 'allowance',
//             args: [address!, contractAddress]
//           });

//           const allowanceInCUSD = parseFloat(allowance.toString()) / 1e18;
//           console.log('[STAKING] 💰 Allowance:', allowanceInCUSD, 'cUSD');

//           if (allowanceInCUSD < 1) {
//             console.error('[STAKING] ❌ Allowance too low:', allowanceInCUSD);
//             setNotification({
//               show: true,
//               title: 'Approval Incomplete',
//               message: `Approval not sufficient. Please try again. Current allowance: ${allowanceInCUSD} cUSD`,
//               type: 'error'
//             });
//             return;
//           }

//           console.log('[STAKING] ✅ Allowance confirmed, calling payEntry...');
//           payEntry({
//             address: contractAddress,
//             abi: DAILY_TOURNAMENT_ABI,
//             functionName: 'payEntry',
//             // ⚠️ No feeCurrency here — gas will be paid in native CELO
//           } as any);          
//           console.log('[STAKING] 📤 payEntry transaction sent to MiniPay');
//         } catch (error: any) {
//           console.error('[STAKING] ❌ Error in checkAllowanceAndPay:', error);
//           setNotification({
//             show: true,
//             title: 'Transaction Failed',
//             message: error?.message || 'Failed to pay entry fee. Please try again.',
//             type: 'error'
//           });
//         }
//       };

//       checkAllowanceAndPay();
//     }
//   }, [hasApproved, approveHash, contractAddress, payEntry, address, config]);

//   // Handle successful entry payment
//   useEffect(() => {
//     if (hasEntryPaid && address && payEntryHash) {
//       console.log('[STAKING] ✅ Entry fee paid successfully! Hash:', payEntryHash);
//       setHasStaked(true);

//       // Persist to localStorage
//       const storageKey = `hasStaked_${address}_${contractAddress}`;
//       localStorage.setItem(storageKey, 'true');
//       console.log('[STAKING] 💾 Saved stake status to localStorage');

//       // Automatically start the game after staking
//       console.log('[STAKING] 🎮 Dispatching stakeConfirmed event...');
//       window.dispatchEvent(new CustomEvent('stakeConfirmed'));
//     }
//   }, [hasEntryPaid, address, contractAddress, payEntryHash]);

//   // Handle successful score submission
//   useEffect(() => {
//     if (hasScoreSubmitted) {
//       setIsSubmittingScore(false);
//       setShowScoreModal(false);
//       console.log('Score submitted to blockchain!');
//       setNotification({
//         show: true,
//         title: 'Score Submitted! 🎉',
//         message: `Your score of ${currentScore.toLocaleString()} has been submitted to the blockchain leaderboard!\n\nGood luck in the daily tournament!`,
//         type: 'success'
//       });
//     }
//   }, [hasScoreSubmitted, currentScore]);

//   // Handle leaderboard requests from Phaser
//   useEffect(() => {
//     const handleLeaderboardRequest = async () => {
//       console.log('[CeloRidersGame] Leaderboard requested. Connected:', isConnected);

//       if (!isConnected) {
//         console.log('[CeloRidersGame] Wallet not connected, sending error');
//         window.dispatchEvent(new CustomEvent('leaderboardError', {
//           detail: { error: 'Wallet not connected' }
//         }));
//         return;
//       }

//       try {
//         console.log('[CeloRidersGame] Fetching leaderboard from blockchain...');
//         const leaderboard = await readContract(config, {
//           address: contractAddress,
//           abi: DAILY_TOURNAMENT_ABI,
//           functionName: 'getCurrentLeaderboard',
//         });

//         console.log('[CeloRidersGame] Raw leaderboard data:', leaderboard);

//         // Transform to format expected by Phaser scene
//         // Filter out empty entries (address = 0x0000...)
//         const formattedData = leaderboard
//           .map((player, index) => ({
//             rank: index + 1,
//             address: player.playerAddress,
//             score: Number(player.score)
//           }))
//           .filter(entry => entry.address !== '0x0000000000000000000000000000000000000000' && entry.score > 0);

//         console.log('[CeloRidersGame] Formatted leaderboard:', formattedData);

//         window.dispatchEvent(new CustomEvent('leaderboardData', {
//           detail: { leaderboard: formattedData }
//         }));
//       } catch (error: any) {
//         console.error('[CeloRidersGame] Error fetching leaderboard:', error);
//         window.dispatchEvent(new CustomEvent('leaderboardError', {
//           detail: { error: error.message || 'Failed to fetch leaderboard' }
//         }));
//       }
//     };

//     window.addEventListener('requestLeaderboard', handleLeaderboardRequest);

//     return () => {
//       window.removeEventListener('requestLeaderboard', handleLeaderboardRequest);
//     };
//   }, [isConnected, contractAddress, config]);

//   // Initialize Phaser game
//   useEffect(() => {
//     if (!containerRef.current || gameRef.current) return;

//     const config: Phaser.Types.Core.GameConfig = {
//       type: Phaser.AUTO,
//       parent: containerRef.current,
//       width: 640,
//       height: 960,
//       backgroundColor: '#000000',
//       physics: {
//         default: 'arcade',
//         arcade: {
//           gravity: { x: 0, y: 2000 },
//           debug: false,
//         },
//       },
//       scene: [
//         Preload,
//         Splash1,
//         Splash2,
//         Splash3,
//         Splash4,
//         Splash5,
//         MainMenu,
//         CharacterSelect,
//         Game,
//         GameOver,
//         OptionsMenu,
//         HowToPlay,
//         Leaderboard,
//       ],
//       scale: {
//         mode: Phaser.Scale.FIT,
//         autoCenter: Phaser.Scale.CENTER_BOTH,
//       },
//     };

//     gameRef.current = new Phaser.Game(config);

//     // Listen for game events
//     const gameStartListener = (e: Event) => handleGameStart(e as CustomEvent);
//     const gameOverListener = (e: Event) => handleGameOver(e as CustomEvent<{ score: number }>);

//     window.addEventListener('gameStartRequested', gameStartListener);
//     window.addEventListener('gameOver', gameOverListener);

//     return () => {
//       window.removeEventListener('gameStartRequested', gameStartListener);
//       window.removeEventListener('gameOver', gameOverListener);

//       if (gameRef.current) {
//         gameRef.current.destroy(true);
//         gameRef.current = null;
//       }
//     };
//   }, []);

//   // Handle game start - require wallet connection and staking
//   const handleGameStart = async (_event: CustomEvent) => {
//     console.log('Game start requested. Connected:', isConnected, 'Has staked:', hasStaked);

//     if (!isConnected) {
//       const message = isMiniPay
//         ? 'MiniPay wallet not detected. Please ensure you are using MiniPay.'
//         : 'Please connect your wallet to play CeloRiders!';
//       setNotification({
//         show: true,
//         title: 'Wallet Not Connected',
//         message,
//         type: 'warning'
//       });
//       return;
//     }

//     if (!hasStaked) {
//       console.log('No stake found, showing modal');
//       // Show modal instead of confirm
//       setShowStakeModal(true);
//       return;
//     }

//     // Allow game to start
//     console.log('Dispatching stakeConfirmed event');
//     window.dispatchEvent(new CustomEvent('stakeConfirmed'));
//   };

//   const handleStakeConfirm = async () => {
//     console.log('[STAKING] 🔘 Approve button clicked!');
//     console.log('[STAKING] 📊 Wallet connected:', isConnected);
//     console.log('[STAKING] 📊 User address:', address);
//     console.log('[STAKING] 📊 Contract address:', contractAddress);
//     console.log('[STAKING] 📊 isMiniPay:', isMiniPay);

//     if (!isConnected || !address) {
//       console.error('[STAKING] ❌ Wallet not connected!');
//       setNotification({
//         show: true,
//         title: 'Wallet Not Connected',
//         message: 'Please connect your wallet first.',
//         type: 'error'
//       });
//       return;
//     }

//     setShowStakeModal(false);

//     try {
//       console.log('[STAKING] 🎯 Starting staking process...');
//       console.log('[STAKING] 📝 Step 1/2: Approving cUSD for contract...');
//       console.log('[STAKING] 💰 Approving 1 cUSD (', parseEther('1').toString(), 'wei)');

//       // First approve the contract to spend 1 cUSD
//       const result = approveToken({
//         address: CUSD_ADDRESS,
//         abi: ERC20_ABI,
//         functionName: 'approve',
//         args: [contractAddress, parseEther('1')],
//         feeCurrency: CUSD_ADDRESS, // Required for MiniPay on Celo
//       } as any);

//       console.log('[STAKING] 📤 approveToken called, result:', result);
//       console.log('[STAKING] 📤 Approve transaction sent to MiniPay wallet');
//       // payEntry will be called automatically after approval succeeds (see useEffect above)
//     } catch (error: any) {
//       console.error('[STAKING] ❌ Error approving cUSD:', error);
//       console.error('[STAKING] ❌ Error details:', {
//         message: error?.message,
//         code: error?.code,
//         stack: error?.stack
//       });
//       setNotification({
//         show: true,
//         title: 'Transaction Failed',
//         message: error?.message || 'Failed to approve cUSD. Please try again.',
//         type: 'error'
//       });
//       setShowStakeModal(true); // Show modal again so user can retry
//     }
//   };

//   const handleStakeCancel = () => {
//     setShowStakeModal(false);
//   };

//   // Handle game over - submit score to blockchain
//   const handleGameOver = async (event: CustomEvent<{ score: number }>) => {
//     const score = event.detail.score;
//     setCurrentScore(score);

//     console.log('Game over! Score:', score);

//     if (!isConnected || !hasStaked) {
//       console.log('Not connected or not staked, skipping score submission');
//       setNotification({
//         show: true,
//         title: 'Game Over!',
//         message: `Your Score: ${score.toLocaleString()}\n\nConnect your wallet and stake 1 cUSD to submit scores to the blockchain leaderboard and compete for prizes!`,
//         type: 'info'
//       });
//       return;
//     }

//     // Show score submission modal
//     setShowScoreModal(true);
//   };

//   const handleScoreSubmitConfirm = async () => {
//     setIsSubmittingScore(true);

//     try {
//       console.log('Submitting score to blockchain:', currentScore);
//       submitScore({
//         address: contractAddress,
//         abi: DAILY_TOURNAMENT_ABI,
//         functionName: 'submitScore',
//         args: [BigInt(Math.floor(currentScore))],
//         feeCurrency: CUSD_ADDRESS, // Required for MiniPay on Celo
//       } as any);
//     } catch (error) {
//       console.error('Error submitting score:', error);
//       setNotification({
//         show: true,
//         title: 'Submission Failed',
//         message: 'Failed to submit score to the blockchain. Please try again.',
//         type: 'error'
//       });
//       setIsSubmittingScore(false);
//     }
//   };

//   const handleScoreSubmitCancel = () => {
//     setShowScoreModal(false);
//     console.log('Score submission cancelled');
//   };

//   return (
//     <div className="relative w-full h-screen bg-black flex items-center justify-center">
//       {/* Game Container */}
//       <div ref={containerRef} className="game-container" />

//       {/* Stake Modal */}
//       <StakeModal
//         isOpen={showStakeModal}
//         onConfirm={handleStakeConfirm}
//         onCancel={handleStakeCancel}
//         isMiniPay={isMiniPay}
//       />

//       {/* Score Submit Modal */}
//       <ScoreSubmitModal
//         isOpen={showScoreModal}
//         score={currentScore}
//         onConfirm={handleScoreSubmitConfirm}
//         onCancel={handleScoreSubmitCancel}
//         isSubmitting={isSubmittingScore}
//       />

//       {/* Notification Modal */}
//       <NotificationModal
//         isOpen={notification.show}
//         title={notification.title}
//         message={notification.message}
//         type={notification.type}
//         onClose={() => setNotification({ ...notification, show: false })}
//       />

//       {/* Overlay UI */}
//       {!isConnected && !isMiniPay && (
//         <div className="absolute top-4 left-0 right-0 text-center px-4">
//           <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg inline-block font-bold text-sm sm:text-base">
//             Connect your wallet to play CeloRiders!
//           </div>
//         </div>
//       )}

//       {isConnected && !hasStaked && !isMiniPay && (
//         <div className="absolute top-4 left-0 right-0 text-center px-4">
//           <div className="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block font-bold text-sm sm:text-base">
//             Stake 1 cUSD to play!
//           </div>
//         </div>
//       )}

//       {(isApproving || isPayingEntry) && (
//         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <p className="font-bold text-base sm:text-lg text-center">
//               {isApproving
//                 ? (isMiniPay ? 'Approve in MiniPay' : 'Approving cUSD...')
//                 : (isMiniPay ? 'Approve Payment in MiniPay' : 'Processing entry payment...')
//               }
//             </p>
//             {isApproving && (
//               <p className="text-sm text-gray-600 mt-2 text-center">
//                 Step 1 of 2: Approving token
//                 {isMiniPay && <><br />Check MiniPay for approval request</>}
//               </p>
//             )}
//             {isPayingEntry && (
//               <p className="text-sm text-gray-600 mt-2 text-center">
//                 Step 2 of 2: Paying entry fee
//                 {isMiniPay && <><br />✋ Check MiniPay to approve the payment!</>}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {isSubmittingOnChain && (
//         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white text-black px-8 py-6 rounded-lg mx-4 max-w-sm">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
//             <p className="font-bold text-base sm:text-lg text-center">Submitting score to blockchain...</p>
//           </div>
//         </div>
//       )}

//       {/* Wallet Info */}
//       {isConnected && (
//         <div className="absolute bottom-4 right-4 bg-white bg-opacity-10 text-white px-4 py-2 rounded-lg text-sm">
//           <p className="font-mono">
//             {address?.slice(0, 6)}...{address?.slice(-4)}
//           </p>
//           {hasStaked && (
//             <p className="text-green-400 text-xs mt-1">✓ Staked</p>
//           )}
//         </div>
//       )}

//       <style jsx>{`
//         .game-container {
//           max-width: 100vw;
//           max-height: 100vh;
//         }
//       `}</style>
//     </div>
//   );
// }



