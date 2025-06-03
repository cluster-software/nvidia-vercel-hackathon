export interface OptinFlowNode {
  id: number;
  org_id: string;
  type: string;
  next_node_id?: number;
  flexible_content?: any;
  discount?: {
    secondary_button?: {
      discount_info?: any;
    };
  };
}