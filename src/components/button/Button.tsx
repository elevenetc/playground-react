import * as styles from './Button.css';

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({ children, disabled = false, onClick }: ButtonProps) {
  return (
    <button className={styles.button} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
