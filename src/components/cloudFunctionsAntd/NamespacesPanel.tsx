import {Collapse, List, Typography} from 'antd';
import {useAppDispatch, useAppSelector} from "@/components/cloudFunctionsAntd/state/hooks";
import {
    fetchNamespaces,
    namespacesSelectors,
    selectNamespacesError,
    selectNamespacesLoading
} from "@/components/cloudFunctionsAntd/namespaces/namespacesSlice";
import {useEffect} from "react";

const {Text} = Typography;

export default function NamespacesPanel() {

    const dispatch = useAppDispatch();
    const namespaces = useAppSelector(namespacesSelectors.selectAll);
    const loading = useAppSelector(selectNamespacesLoading);
    const error = useAppSelector(selectNamespacesError);

    useEffect(() => {
        dispatch(fetchNamespaces());
    }, [dispatch]);

    if (loading === "loading") return <div>Loading namespaces…</div>;
    if (loading === "loadingError") return <div>Failed to load namespaces: {error}</div>;

    const items = namespaces.map((namespace) => ({
        key: namespace.id,
        label: `${namespace.name} (${namespace.functions.length})`,
        children: namespace.functions.length === 0 ? (
            <Text type="secondary">No functions</Text>
        ) : (
            <List
                size="small"
                dataSource={namespace.functions}
                renderItem={(func) => (
                    <List.Item>
                        <Text>{func.name}</Text>
                    </List.Item>
                )}
            />
        ),
    }));

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Namespaces</h3>
            {namespaces.length === 0 ? (
                <div>No namespaces</div>
            ) : (
                <Collapse items={items} defaultActiveKey={[]}/>
            )}
        </div>
    );
}
