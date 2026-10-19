import { IndustrialCase } from '../types/reliability';

export const INDUSTRIAL_CASES: IndustrialCase[] = [
  {
    id: 'hsr-traction',
    title: '高铁列车牵引变流器系统',
    subtitle: 'High-Speed Rail Traction Converter Unit',
    industry: '轨道交通装备',
    badge: '串联高可靠性 & 元器件失效率分配',
    mappingConcept: '串联系统可靠性乘积法则、IGBT热应力失效率分配与板卡级降额设计',
    summary:
      '高铁动车组牵引变流器将高压接触网电能转换为调频调压三相交流电驱动牵引电机。系统内部主电路拓扑呈现典型的严格串联关系，任何单一核心子部件击穿将导致整节动车牵引闭锁。',
    challenge:
      '350km/h 严苛运行环境下，强电磁脉冲干扰、高频IGBT结温循环冲击（ΔTj > 60℃）与机械高频振动叠加，要求整机系统 MTBF 不低于 50,000 小时。',
    weibullParams: {
      beta: 1.05, // 近似指数分布偶然失效
      eta: 48000,
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'series',
      components: [
        { name: '大功率IGBT逆变桥臂', mtbf: 120000, mttr: 4, failureRate: 8.33e-6, role: '主开关器件' },
        { name: '低感直流支撑薄膜滤波电容', mtbf: 250000, mttr: 3, failureRate: 4.0e-6, role: '平波滤波' },
        { name: '双核DSP+FPGA驱动控制模块', mtbf: 180000, mttr: 2, failureRate: 5.56e-6, role: 'PWM脉宽调制' },
        { name: '强制纯水冷却循环主泵组', mtbf: 150000, mttr: 5, failureRate: 6.67e-6, role: '水冷散热闭环' },
      ],
    },
    ftaTopEvent: {
      name: '牵引变流器紧急封锁跳闸',
      gate: 'OR',
      causes: [
        { name: 'IGBT键合线脱落过流击穿', prob: 0.008, code: 'BE_IGBT' },
        { name: '支撑电容自愈失效短路', prob: 0.004, code: 'BE_CAP' },
        { name: '主控板门极驱动欠压告警', prob: 0.005, code: 'BE_GATE' },
        { name: '水冷管路漏液压力骤降', prob: 0.006, code: 'BE_COOL' },
      ],
    },
    maintenanceParams: {
      cf: 45, // 突发线路趴窝晚点惩罚与救援成本（万元）
      cp: 3.2, // 库内二级修定检更换备件成本（万元）
      currentTp: 8000,
      optimalTp: 7500,
    },
    engineeringInsight:
      '根据串联系统可靠性乘积法则 R_sys = ∏ R_i，系统整体失效率等于各组件之和。对IGBT等薄弱器件实施功率降额（电压降额至65%、电流降额至70%），并引入光纤隔离驱动，可使整机 MTBF 突破 42,000 小时。',
  },
  {
    id: 'aero-blade',
    title: '航空发动机关键转子叶片',
    subtitle: 'Aero-Engine High-Pressure Turbine Rotor Blade',
    industry: '航空宇航推进',
    badge: '威布尔分布 & 低周疲劳(LCF)失效',
    mappingConcept: '威布尔形状参数 β>2.5 拟合、疲劳裂纹扩展与微观蠕变耗损失效',
    summary:
      '现代大推力高旁通比涡扇发动机高压涡轮叶片工作于 1600℃ 超温、高压燃气冲刷与万转离心力多轴应力场下，其寿命表现出显著的低周疲劳与热机械蠕变磨损特性。',
    challenge:
      '高压涡轮叶片属于飞行安全关键单点结构件（无机械并联冗余可能），单次叶片断裂飞脱（Blade-Out）将酿成非包容性机匣穿透灾难。必须精准推算 B10 疲劳寿命与强制报废时限。',
    weibullParams: {
      beta: 2.85, // 典型严重机械磨损与低周疲劳
      eta: 5200, // 循环飞行小时
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'series',
      components: [
        { name: '叶身气膜冷却孔阵列', mtbf: 6200, mttr: 48, failureRate: 1.61e-4, role: '高温绝热保护' },
        { name: '叶冠锯齿阻尼阻尼块', mtbf: 8500, mttr: 36, failureRate: 1.17e-4, role: '振动应力抑制' },
        { name: '榫头纵向枞树型承载齿', mtbf: 9800, mttr: 60, failureRate: 1.02e-4, role: '离心拉力传递' },
      ],
    },
    ftaTopEvent: {
      name: '高压涡轮叶片突发断裂飞脱',
      gate: 'OR',
      causes: [
        { name: '榫槽圆角微裂纹超临界扩展', prob: 0.0012, code: 'BE_CRACK' },
        { name: '气膜孔重结晶热腐蚀穿孔', prob: 0.0018, code: 'BE_HOTCORR' },
        { name: '外来物冲击(FOD)缺口应力集中', prob: 0.0008, code: 'BE_FOD' },
      ],
    },
    maintenanceParams: {
      cf: 350, // 空中停车翻修与航线安全停飞损失（万元）
      cp: 18, // 翻修厂孔探检查与内窥无损探伤更换（万元）
      currentTp: 2400,
      optimalTp: 2150,
    },
    engineeringInsight:
      '由于 β = 2.85 远大于 1.0，叶片失效率随飞行小时急剧上升（超线性加速）。严禁依靠事后检修！必须在到达 B10 寿命点（约 2,300 小时）之前执行强制翻修更换。',
  },
  {
    id: 'chem-compressor',
    title: '化工连续生产大压机机组',
    subtitle: 'Continuous Chemical Plant Reciprocating Gas Compressor',
    industry: '石油炼化 & 煤化工',
    badge: '并联冗余 & 固有可用度(Availability)',
    mappingConcept: '并联冗余并网、MTTR 修复时间抑制与可用度 99.9% 目标达成',
    summary:
      '合成氨与重整加氢装置核心裂解气压缩机组属于 24 小时不间断连续化流水线命脉。非计划停机 1 小时即导致全装置物料放空火炬燃烧，造成数百万直接经济损失。',
    challenge:
      '单台压缩机机械动密封、气阀与曲轴承瓦受高压含硫气体腐蚀磨损严重，单机 MTBF 仅 6,000 小时。工程上采用“一开一备”自动快速切换并联冗余架构。',
    weibullParams: {
      beta: 1.45,
      eta: 7200,
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'parallel',
      components: [
        { name: 'A列主运行大排量压缩机组', mtbf: 6500, mttr: 18, failureRate: 1.53e-4, role: '在线负荷主力' },
        { name: 'B列热备用快速互锁压缩机组', mtbf: 6500, mttr: 18, failureRate: 1.53e-4, role: '热态待机热备' },
      ],
    },
    ftaTopEvent: {
      name: '化工原料气管线超压联锁停车',
      gate: 'AND',
      causes: [
        { name: 'A机主级气阀弹簧断裂泄压', prob: 0.035, code: 'BE_COMP_A' },
        { name: 'B备机自启旁路电磁阀卡死', prob: 0.015, code: 'BE_VALVE_B' },
      ],
    },
    maintenanceParams: {
      cf: 120, // 装置紧急放空停产与催化剂中毒损失（万元）
      cp: 8.5, // 计划检修工件配重研磨与密封更新（万元）
      currentTp: 3600,
      optimalTp: 2800,
    },
    engineeringInsight:
      '通过 1+1 热备用并联配置，即使单机可用度仅为 99.72%，并联后系统综合固有可用度可飞跃至 99.999%（年非计划停机时间由 24 小时缩减至 5 分钟以内）。',
  },
  {
    id: 'auto-domain',
    title: '智能网联汽车自动驾驶域控制器',
    subtitle: 'L3/L4 Autonomous Driving Central Computing Unit',
    industry: '新能源与智能网联汽车',
    badge: '故障树分析(FTA) & 异构双Orin冗余',
    mappingConcept: 'ISO 26262 ASIL-D 故障树最小割集辨识、共因失效(CCF)防范与三冗余供电',
    summary:
      '自动驾驶域控制器（ADCU）承担高阶感知融合、路径规划决策与线控底盘执行指令发布。要求单点失效不能导致主控脑死亡，必须实现从 Fail-Safe（故障安全）到 Fail-Operational（故障运行）的跨越。',
    challenge:
      '主算力芯片采用异构双 SoC（双 Nvidia Orin-X）+ 独立安全 MCU（Infineon TC397）。需通过 FTA 验证顶事件（“高速领航辅助中指令突发中断”）发生率低于 10 FIT。',
    weibullParams: {
      beta: 1.0, // 汽车电子芯片偶然随机失效
      eta: 120000,
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'hybrid',
      components: [
        { name: '主 SoC-A 感知推理引擎', mtbf: 150000, mttr: 1, failureRate: 6.67e-6, role: '主感知' },
        { name: '备 SoC-B 冗余决策规划', mtbf: 150000, mttr: 1, failureRate: 6.67e-6, role: '备计算' },
        { name: '安全 MCU 独立心跳看门狗', mtbf: 350000, mttr: 0.5, failureRate: 2.85e-6, role: '锁步仲裁' },
        { name: '双通道独立隔离车载以太网', mtbf: 280000, mttr: 1, failureRate: 3.57e-6, role: '骨干总线' },
      ],
    },
    ftaTopEvent: {
      name: '自动驾驶运动控制命令全失效',
      gate: 'OR',
      causes: [
        { name: '双SoC共享时钟源突发同频失效(共因)', prob: 0.00002, code: 'BE_CCF_CLK' },
        { name: '底盘CAN总线双路物理短路', prob: 0.00005, code: 'BE_BUS_SHORT' },
        { name: '低压蓄电池与DCDC双断电', prob: 0.00003, code: 'BE_POWER_LOSS' },
      ],
    },
    maintenanceParams: {
      cf: 200, // 召回、重大事故赔付与品牌信誉损失（万元）
      cp: 1.5, // 4S店 OTA 软件刷写与硬件诊断筛查（万元）
      currentTp: 15000,
      optimalTp: 12000,
    },
    engineeringInsight:
      'FTA 最小割集分析揭示：若两颗 SoC 共享同一颗外部晶振或同一块电源管理芯片（PMIC），将形成 1 阶危险单点割集。工程上必须彻底做物理时钟解耦与双电源隔离，消除共因失效。',
  },
  {
    id: 'wind-turbine',
    title: '海上风力发电机组运维优化',
    subtitle: 'Offshore 10MW+ Wind Turbine Gearbox & Generator O&M',
    industry: '可再生能源装备',
    badge: '维修策略帕累托权衡 & 停机损失优化',
    mappingConcept: '预防性维修周期与更换成本/停机损失权衡、浴盆曲线后段磨损预防',
    summary:
      '深远海 10MW+ 风机长期直面高盐雾腐蚀、巨浪冲击载荷与频繁台风。主齿轮箱行星轮系轴承与发电机偏航机构承受重载交变冲击，易发生剥落微动磨损。',
    challenge:
      '海上运维对海况窗口期（浪高 < 1.5m）依赖极强。突发故障必须调配千吨级自升式风电安装船出海（租金高达 80 万/天），且海上抢修耗时漫长；但过度频繁检查又耗尽预算。',
    weibullParams: {
      beta: 2.3, // 明显轴承点蚀剥落与疲劳磨损
      eta: 18000, // 小时（约2年）
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'series',
      components: [
        { name: '主齿轮箱三级行星齿轮轮齿', mtbf: 22000, mttr: 120, failureRate: 4.55e-5, role: '传动主载荷' },
        { name: '发电机前轴承陶瓷绝缘套', mtbf: 26000, mttr: 96, failureRate: 3.85e-5, role: '轴电流绝缘' },
        { name: '电液伺服变桨距执行机构', mtbf: 19000, mttr: 48, failureRate: 5.26e-5, role: '迎风角度调节' },
      ],
    },
    ftaTopEvent: {
      name: '海上风电机组紧急抱闸停机',
      gate: 'OR',
      causes: [
        { name: '主轴承滚道大面积剥落卡死', prob: 0.022, code: 'BE_BEARING' },
        { name: '变流器水冷管路海洋生物附着堵塞', prob: 0.018, code: 'BE_BIO_CLOG' },
        { name: '偏航减速箱齿面塑性变形断齿', prob: 0.015, code: 'BE_GEAR_BROKE' },
      ],
    },
    maintenanceParams: {
      cf: 85, // 包含深海工程船出海、弃风电量损失与大部件更换（万元）
      cp: 7.2, // 窗口期定期滑油光谱分析与预防性注脂（万元）
      currentTp: 7200,
      optimalTp: 5800,
    },
    engineeringInsight:
      '当停机损失成本远大于预防成本（Cf/Cp > 10）且 β=2.3 时，成本曲线呈现典型的深“U”形帕累托谷底。将定检更换周期从原先粗放的 7200 小时前移至 5800 小时，不仅不会增加年均总支出，反倒能降低 43% 的非计划海上停机总损失。',
  },
  {
    id: 'urban-rail-cbtc',
    title: '城市轨道交通信号核心网',
    subtitle: 'Urban Rail CBTC (Communication-Based Train Control) Core',
    industry: '智慧城轨与列控',
    badge: '复杂混联网络 & MTBF 极限评估',
    mappingConcept: '2oo2-2oo2 双机双控四冗余计算机联锁与混联高可用度网络拓扑',
    summary:
      '城市轨道交通基于通信的列车运行控制系统（CBTC）承载着地铁 90 秒超短发车间隔下的安全行车。核心机房计算机联锁系统（CBI）与无线通信环网直接决定整条线路的行车许可。',
    challenge:
      '超大城市早晚高峰客流密度极大，一旦信号系统出现 5 分钟红光带全线趴窝，将引发极高社会安全风险。联锁机要求平均无危险故障间隔时间（MTBF_hazard）达到 10^7 小时（SIL-4 级）。',
    weibullParams: {
      beta: 1.0, // 偶然失效期（超纯净机房环境）
      eta: 95000,
      gamma: 0,
    },
    rbdArchitecture: {
      systemType: 'k_out_of_n',
      k: 2,
      n: 3,
      components: [
        { name: '联锁安全运算主机 A', mtbf: 85000, mttr: 0.2, failureRate: 1.18e-5, role: '三取二安全比对' },
        { name: '联锁安全运算主机 B', mtbf: 85000, mttr: 0.2, failureRate: 1.18e-5, role: '三取二安全比对' },
        { name: '联锁安全运算主机 C', mtbf: 85000, mttr: 0.2, failureRate: 1.18e-5, role: '三取二安全比对' },
      ],
    },
    ftaTopEvent: {
      name: '车站联锁全区失去联锁保护停运',
      gate: 'AND',
      causes: [
        { name: '2oo3 联锁机两台及以上同机柜供电中断', prob: 0.00008, code: 'BE_2OO3_FAIL' },
        { name: '主备双光纤环网节点收发器雷击双断', prob: 0.00005, code: 'BE_RING_FAIL' },
      ],
    },
    maintenanceParams: {
      cf: 150, // 早高峰全线停运重大公共安全事件应对（万元）
      cp: 2.8, // 夜间天窗点无扰在线倒机测试维护（万元）
      currentTp: 24000,
      optimalTp: 20000,
    },
    engineeringInsight:
      '采用 2 取 3（2oo3）表决冗余机制配合专用轨旁安全通信协议（RSSP-I），即使单台运算主机发生内存翻转或死机，表决器能在 100ms 内屏蔽故障机，实现 0 扰动在线切换，系统综合固有可用度高达 99.9999%。',
  },
];
