import {Badge, Collapse, List, Typography} from 'antd';
import {useAppDispatch, useAppSelector} from "@/components/cloudFunctionsAntd/state/hooks";
import {
    fetchNamespaces,
    namespacesSelectors,
    selectNamespacesError,
    selectNamespacesLoading
} from "@/components/cloudFunctionsAntd/namespaces/namespacesSlice";
import {useEffect} from "react";
import {namespaceSelected} from "@/components/cloudFunctionsAntd/state/uiSlice";
import {selectSelectedNamespaceId} from "@/components/cloudFunctionsAntd/state/selectors";

const {Text} = Typography;

export default function NamespacesPanel() {

    const dispatch = useAppDispatch();
    const namespaces = useAppSelector(namespacesSelectors.selectAll);
    const loading = useAppSelector(selectNamespacesLoading);
    const error = useAppSelector(selectNamespacesError);
    const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId);

    useEffect(() => {
        dispatch(fetchNamespaces());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedNamespaceId && namespaces.length > 0) {
            dispatch(namespaceSelected(namespaces[0].id));
        }
    }, [selectedNamespaceId, namespaces, dispatch]);

    if (loading === "loading") return <div>Loading namespaces…</div>;
    if (loading === "loadingError") return <div>Failed to load namespaces: {error}</div>;

    const handleNamespaceChange = (keys: string | string[]) => {
        const key = Array.isArray(keys) ? keys[0] : keys;
        if (key) {
            dispatch(namespaceSelected(key));
        }
    };

    const items = namespaces.map((namespace) => {
        const isSelected = namespace.id === selectedNamespaceId;
        return {
            key: namespace.id,
            label: (
                <span onClick={() => dispatch(namespaceSelected(namespace.id))}>
                    {isSelected && <Badge status="processing"/>}
                    {namespace.name} ({namespace.functions.length})
                </span>
            ),
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
        };
    });

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Namespaces</h3>
            {namespaces.length === 0 ? (
                <div>No namespaces</div>
            ) : (
                <Collapse
                    items={items}
                    defaultActiveKey={[]}
                    onChange={handleNamespaceChange}
                />
            )}
        </div>
    );
}
