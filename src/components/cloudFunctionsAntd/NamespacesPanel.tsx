import {List} from 'antd';
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

    return (
        <div className="h-full bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Namespaces</h3>
            {namespaces.length === 0 ? (
                <div className="text-gray-400">No namespaces</div>
            ) : (
                <List
                    size="small"
                    dataSource={namespaces}
                    renderItem={(namespace) => {
                        const isSelected = namespace.id === selectedNamespaceId;
                        return (
                            <List.Item
                                onClick={() => dispatch(namespaceSelected(namespace.id))}
                                className={`cursor-pointer rounded px-2 ${
                                    isSelected
                                        ? 'bg-blue-600/30 border-l-2 border-blue-500'
                                        : 'hover:bg-gray-700/50'
                                }`}
                            >
                                <span className="text-white font-mono text-sm">
                                    {namespace.name}
                                </span>
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );
}
