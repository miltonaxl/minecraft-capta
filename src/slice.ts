import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getJson } from './services/http';
import { canComplete, normalizeSkillTree } from './domain/skillTree';

export interface SkillNode {
    id: string;
    name: string;
    description: string;
    image: string;
    childrenIds: string[];
    parentId?: string;
    completed: boolean;
}

export interface SliceState {
    nodesById: Record<string, SkillNode>;
    rootIds: string[];
    currentUrl: string;
    loading: boolean;
    error?: string;
}

const DEFAULT_URL = 'https://minecraft.capta.co/BaseSkillTree.json';

const initialState: SliceState = {
    nodesById: {},
    rootIds: [],
    currentUrl: DEFAULT_URL,
    loading: false,
    error: undefined,
};

export const parseUrlFromLocation = createAsyncThunk(
    'skillTree/parseUrlFromLocation',
    async () => {
        if (typeof window === 'undefined') return null;
        const u = new URL(window.location.href);
        return u.searchParams.get('json');
    }
);

export const fetchSkillTree = createAsyncThunk(
    'skillTree/fetch',
    async (url: string) => {
        try {
            const json = await getJson(url);
            return normalizeSkillTree(json);
        } catch (e) {
            console.warn('Falling back to local sample tree due to fetch error:', e);
            return normalizeSkillTree({});
        }
    }
);

export const slice = createSlice({
    name: 'Minecraft-Skill-Tree',
    initialState,
    reducers: {
        setUrl(state, action: PayloadAction<string>) {
            state.currentUrl = action.payload;
        },
        toggleComplete(state, action: PayloadAction<string>) {
            const id = action.payload;
            const node = state.nodesById[id];
            if (!node) return;
            // Un-complete cascades to all descendants
            if (node.completed) {
                const stack: string[] = [id];
                while (stack.length) {
                    const curId = stack.pop()!;
                    const cur = state.nodesById[curId];
                    if (!cur) continue;
                    cur.completed = false;
                    for (const cid of cur.childrenIds) stack.push(cid);
                }
                return;
            }
            // To complete, all ancestors must be completed
            if (!canComplete(state.nodesById, id)) return;
            node.completed = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(parseUrlFromLocation.fulfilled, (state, action) => {
                const url = action.payload;
                if (url) state.currentUrl = url;
            })
            .addCase(fetchSkillTree.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchSkillTree.fulfilled, (state, action) => {
                state.loading = false;
                state.error = undefined;
                state.nodesById = action.payload.nodesById;
                state.rootIds = action.payload.rootIds;
                // Reset completion state when loading a new tree
                for (const id of Object.keys(state.nodesById)) {
                    state.nodesById[id].completed = false;
                }
            })
            .addCase(fetchSkillTree.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const Actions = { ...slice.actions };
export default slice.reducer;
