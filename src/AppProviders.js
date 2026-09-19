import { SettingsProvider } from './state/SettingsContext';
import { ToastProvider } from './state/ToastContext';
import { LibraryProvider } from './state/LibraryContext';

export default function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <ToastProvider>
        <LibraryProvider>{children}</LibraryProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
