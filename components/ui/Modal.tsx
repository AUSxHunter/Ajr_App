import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ModalProps as RNModalProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useColors } from '../../hooks/useColors';

interface ModalProps extends Omit<RNModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
  position = 'center',
  ...props
}) => {
  const Colors = useColors();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, position === 'bottom' && styles.overlayBottom]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[
                styles.container,
                styles[`size_${size}`],
                position === 'bottom' && styles.containerBottom,
                { backgroundColor: Colors.background.secondary },
              ]}
            >
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: Colors.text.primary }]}>{title}</Text>
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Feather name="x" size={24} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  const Colors = useColors();

  return (
    <Modal visible={visible} onClose={onClose} size="sm" showCloseButton={false}>
      <View style={styles.confirmContent}>
        <Text style={[styles.confirmTitle, { color: Colors.text.primary }]}>{title}</Text>
        <Text style={[styles.confirmMessage, { color: Colors.text.secondary }]}>{message}</Text>
        <View style={styles.confirmButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: Colors.background.card }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: Colors.text.secondary }]}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: variant === 'danger' ? Colors.semantic.danger : Colors.accent.primary },
            ]}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            <Text style={[styles.buttonText, { color: Colors.text.inverse }]}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  container: {
    borderRadius: BorderRadius.xl,
    maxHeight: '90%',
    width: '100%',
  },
  containerBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '85%',
  },
  size_sm: {
    maxWidth: 320,
  },
  size_md: {
    maxWidth: 400,
  },
  size_lg: {
    maxWidth: 500,
  },
  size_full: {
    maxWidth: '100%',
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  confirmContent: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  confirmTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.fontSize.body,
    fontWeight: '600',
  },
});

export default Modal;
