import PanelComponent, {PanelAlignment} from "@/components/panelComponent/PanelComponent";
import Button from "@/components/button/Button";
import SelectOrCreateFunction from "@/components/cloudFunctions/SelectOrCreateFunction";
import FunctionsCanvas from "@/components/cloudFunctions/FunctionsCanvas";

export default function CloudFunctions() {
    return <div>
        <FunctionsCanvas/>
        <PanelComponent alignment={PanelAlignment.LEFT}>
            <div className="flex flex-col p-4">
                <Button>Foo</Button>
                <Button>Bar</Button>
            </div>
        </PanelComponent>
        <PanelComponent alignment={PanelAlignment.RIGHT} emptyView={<SelectOrCreateFunction />}>
            {/*<div>Foo</div>*/}
        </PanelComponent>
    </div>
}
