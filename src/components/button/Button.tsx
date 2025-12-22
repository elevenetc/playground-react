import * as styles from './Button.css';

type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  inline?: boolean;
};

export default function Button({ children, disabled = false, onClick, inline = false }: ButtonProps) {
  const buttonClass = inline ? styles.inlineButton : styles.button;
  return (
    <button className={buttonClass} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
