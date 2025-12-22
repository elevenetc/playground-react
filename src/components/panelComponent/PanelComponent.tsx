import {panelComponentCss, panelVariants} from "@/components/panelComponent/PanelComponent.css";

export enum PanelAlignment {
    TOP = "top",
    RIGHT = "right",
    BOTTOM = "bottom",
    LEFT = "left"
}

type PanelComponentProps = {
    alignment: PanelAlignment;
    children?: React.ReactNode;
};

export default function PanelComponent({ alignment, children }: PanelComponentProps) {
    const variantClass = panelVariants[alignment];
    return <div className={`${panelComponentCss} ${variantClass}`}>
        {children}
    </div>
}