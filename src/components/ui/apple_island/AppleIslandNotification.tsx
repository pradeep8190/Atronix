import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../../context/NotificationContext';
import './AppleIslandNotification.css';

export const AppleIslandNotification: React.FC = () => {
  const { notification, dismiss } = useNotification();

  const notifType = notification?.type || 'copy';

  return (
    <div className="apple-island-wrapper">
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.id || 'apple-island'}
            className={`apple-island-pill type-${notifType}`}
            onClick={dismiss}
            initial={{
              opacity: 0,
              y: -24,
              scaleX: 0.75,
              scaleY: 0.6,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              scaleX: [0.75, 1.05, 0.98, 1],
              scaleY: [0.6, 0.94, 1.02, 1],
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              y: -20,
              scaleX: 0.8,
              scaleY: 0.7,
              filter: 'blur(6px)',
              transition: { duration: 0.22, ease: 'easeInOut' },
            }}
            transition={{
              layout: { type: 'spring', stiffness: 480, damping: 26, mass: 0.6 },
              scaleX: { duration: 0.38, times: [0, 0.4, 0.75, 1], ease: 'easeOut' },
              scaleY: { duration: 0.38, times: [0, 0.4, 0.75, 1], ease: 'easeOut' },
              y: { type: 'spring', stiffness: 480, damping: 28, mass: 0.6 },
              opacity: { duration: 0.18 },
            }}
          >
            <div className="apple-island-content">
              <span className="apple-island-title">{notification.title}</span>
              {notification.description && (
                <span className="apple-island-desc">{notification.description}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppleIslandNotification;
