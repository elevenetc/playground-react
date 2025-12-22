import {panelComponentCss, panelVariants} from "@/components/panelComponent/PanelComponent.css";

export enum PanelAlignment {
    TOP = "top",
    RIGHT = "right",
    BOTTOM = "bottom",
    LEFT = "left"
}

type PanelComponentProps = {
    alignment: PanelAlignment;
};

export default function PanelComponent({ alignment }: PanelComponentProps) {
    const variantClass = panelVariants[alignment];
    return <div className={`${panelComponentCss} ${variantClass}`}>
        PanelComponent: {alignment}
    </div>
}