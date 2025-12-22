import {panelComponentCss, panelVariants, emptyViewContainer} from "@/components/panelComponent/PanelComponent.css";

export enum PanelAlignment {
    TOP = "top",
    RIGHT = "right",
    BOTTOM = "bottom",
    LEFT = "left"
}

type PanelComponentProps = {
    alignment: PanelAlignment;
    children?: React.ReactNode;
    emptyView?: React.ReactNode;
};

export default function PanelComponent({ alignment, children, emptyView }: PanelComponentProps) {
    const variantClass = panelVariants[alignment];
    return <div className={`${panelComponentCss} ${variantClass}`}>
        {children || (emptyView && <div className={emptyViewContainer}>{emptyView}</div>)}
    </div>
}